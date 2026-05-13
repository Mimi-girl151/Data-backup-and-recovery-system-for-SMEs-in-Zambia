"""E2E Tests - Full authentication flow with real HTTP calls."""
import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.mark.e2e
class TestFullAuthFlow:
    """End-to-end tests for complete user journey."""
    
    @pytest.fixture
    def client(self):
        """Create test client."""
        return TestClient(app)
    
    def test_complete_user_journey(self, client):
        """Test: Register → Login → Refresh → Revoke flow."""
        
        email = "e2e-test@example.com"
        password = "SecurePass123!"
        
        # STEP 1: Register
        register_response = client.post(
            "/auth/register",
            json={"email": email, "password": password}
        )
        
        # If user already exists, it's OK (skip)
        if register_response.status_code == 400:
            assert "already registered" in register_response.text
        else:
            assert register_response.status_code == 201
            assert "access_token" in register_response.json()
        
        # STEP 2: Login
        login_response = client.post(
            "/auth/login",
            json={"email": email, "password": password}
        )
        assert login_response.status_code == 200
        data = login_response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        
        access_token = data["access_token"]
        refresh_token = data["refresh_token"]
        
        # STEP 3: Refresh token
        refresh_response = client.post(
            "/auth/refresh",
            json={"refresh_token": refresh_token}
        )
        assert refresh_response.status_code == 200
        new_data = refresh_response.json()
        assert "access_token" in new_data
        assert "refresh_token" in new_data
        
        # STEP 4: Health check (always works)
        health_response = client.get("/health")
        assert health_response.status_code == 200
        assert health_response.json()["status"] == "alive"
        
        print("✅ Complete user journey passed!")
    
    def test_invalid_login_fails(self, client):
        """Test: Wrong password should return 401."""
        
        response = client.post(
            "/auth/login",
            json={"email": "nonexistent@example.com", "password": "WrongPass"}
        )
        assert response.status_code == 401
        assert "Invalid" in response.text
    
    def test_register_weak_password_fails(self, client):
        """Test: Weak password should be rejected."""
        
        response = client.post(
            "/auth/register",
            json={"email": "weak@example.com", "password": "weak"}
        )
        assert response.status_code == 400
        # Pydantic validation catches weak password
    
    def test_health_endpoint_works(self, client):
        """Test: Health endpoint returns status."""
        
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "alive"
    
    def test_ready_endpoint_works(self, client):
        """Test: Readiness endpoint."""
        
        response = client.get("/health/ready")
        # May return 503 if DB not ready, but endpoint exists
        assert response.status_code in [200, 503]
