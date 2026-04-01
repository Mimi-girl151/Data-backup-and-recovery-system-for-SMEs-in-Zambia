# User Requirement Specification (URS)
## Secure Data Backup and Recovery System for SMEs (MVP)

**Document Version:** 1.0 (MVP Focused)
**Date:** April 1, 2026
**Project:** Secure Data Backup and Recovery System for SMEs
**Prepared for:** Mirika Ziela (Capstone Project)

---

### 1. Introduction

#### 1.1 Purpose
This document outlines the User Requirements for the Minimum Viable Product (MVP) of the Secure Data Backup and Recovery System. The goal of this MVP is to deliver a functional, web-based system that allows users to securely backup and recover files using client-side encryption. This version focuses on core functionality only, deliberately excluding complex automation and live database features to ensure timely delivery and successful demonstration for the capstone project.

#### 1.2 Scope
The MVP will be a web application accessible via any modern browser (Chrome, Firefox, Safari). It will enable users to:
- Register and authenticate securely.
- Upload files that are encrypted client-side using AES-256 before transmission.
- Store encrypted files on the server.
- View a list of previously backed-up files.
- Download and decrypt files to restore them.

This release does **not** include automated scheduling, live application-aware database backups, Kubernetes orchestration, or advanced recovery metrics (RTO/RPO are conceptual for this phase).

---

### 2. User Roles

The system will support two distinct roles to separate administrative functions from end-user activities.

| Role | Description |
| :--- | :--- |
| **Administrator** | Manages the system, has oversight of all backups and users. Can view user activity logs and manage user accounts. |
| **Standard User** | The primary end-user (e.g., an SME employee). Can perform backup and recovery operations for their own files and manage their own profile. |

---

### 3. Functional Requirements

Requirements are categorized by module. Each requirement includes a unique ID, a description, and a priority rating based on the MVP timeline.

- **Must Have:** Essential for the demo. The project cannot be demonstrated without it.
- **Should Have:** Important for completeness but can be substituted with a manual process or explanation if time runs short.
- **Could Have:** Nice-to-have features that add polish but are not critical for the MVP presentation.

#### Module 3.1: Authentication & User Management

| Req ID | Description | Priority |
| :--- | :--- | :--- |
| **AUTH-01** | The system shall provide a user registration form (Name, Email, Password). | Must Have |
| **AUTH-02** | The system shall enforce password complexity (minimum length, mix of characters) during registration. | Should Have |
| **AUTH-03** | The system shall provide a login form (Email, Password) to authenticate existing users. | Must Have |
| **AUTH-04** | The system shall assign the role of "Standard User" to every new registrant. | Must Have |
| **AUTH-05** | The system shall allow an Administrator to view a list of all registered users. | Should Have |
| **AUTH-06** | The system shall invalidate the session upon user logout. | Must Have |
| **AUTH-07** | The system shall restrict access to all application pages and API endpoints to authenticated users only. | Must Have |

#### Module 3.2: Dashboard

| Req ID | Description | Priority |
| :--- | :--- | :--- |
| **DASH-01** | After login, the user shall be presented with a dashboard summarizing their backup activity. | Must Have |
| **DASH-02** | The dashboard shall display the total storage space used by the logged-in user (e.g., in MB/GB). | Should Have |
| **DASH-03** | The dashboard shall display the date/time of the user's last backup operation. | Could Have |
| **DASH-04** | The dashboard shall provide a navigation menu to access "Backup," "Recover," and "Settings" pages. | Must Have |

#### Module 3.3: Backup Operations

| Req ID | Description | Priority |
| :--- | :--- | :--- |
| **BACK-01** | The system shall allow an authenticated user to select one or multiple files from their local machine for backup. | Must Have |
| **BACK-02** | The system shall perform client-side AES-256 encryption on selected files *before* they are uploaded to the server (using Web Crypto API). | Must Have |
| **BACK-03** | The system shall display a loading indicator during file upload and encryption processes. | Should Have |
| **BACK-04** | The system shall store the encrypted file on the server, along with metadata (original filename, encryption initialization vector, upload timestamp, user ID). | Must Have |
| **BACK-05** | The system shall provide clear success or error feedback to the user upon completion of a backup operation. | Must Have |
| **BACK-06** | The system shall reject file uploads that exceed a defined maximum size (e.g., 2GB) to prevent system overload. | Could Have |

#### Module 3.4: Recovery Operations

| Req ID | Description | Priority |
| :--- | :--- | :--- |
| **REC-01** | The system shall display a list of all files backed up by the currently logged-in user. | Must Have |
| **REC-02** | The list shall display the original filename and the date/time of the backup. | Must Have |
| **REC-03** | The system shall allow a user to select a file from the list and initiate a restore/download operation. | Must Have |
| **REC-04** | The system shall retrieve the corresponding encrypted file from storage, decrypt it using the user's provided key/context, and trigger a download to the user's local machine. | Must Have |
| **REC-05** | The system shall allow a user to search for a specific file by name from their backup list. | Could Have |
| **REC-06** | The system shall allow a user to delete a specific file from their backup list. | Should Have |

#### Module 3.5: User Settings

| Req ID | Description | Priority |
| :--- | :--- | :--- |
| **SET-01** | The system shall allow an authenticated user to change their password. | Must Have |
| **SET-02** | The system shall allow a user to permanently delete their account and all associated backed-up data. | Should Have |
| **SET-03** | The system shall require password confirmation before processing account deletion. | Should Have |

#### Module 3.6: Security & Compliance (MVP)

| Req ID | Description | Priority |
| :--- | :--- | :--- |
| **SEC-01** | All data transmitted between the web browser and the server shall be encrypted using HTTPS/TLS 1.2 or higher. | Must Have |
| **SEC-02** | The system shall store all user passwords using a strong hashing algorithm (e.g., bcrypt). | Must Have |
| **SEC-03** | The system shall store only encrypted file data. No plaintext file content shall be retained on the server. | Must Have |

---

### 4. System Constraints & Assumptions (MVP)

1.  **Deployment:** The system will be deployed using **Docker Compose**. Kubernetes is out of scope for the MVP.
2.  **Storage:** For the MVP, encrypted files will be stored on the local server filesystem, not a cloud object store (e.g., AWS S3).
3.  **Database:** The system will use a simple relational database (PostgreSQL or SQLite) for storing user and file metadata.
4.  **Encryption Key Management:** For the MVP, the user's password will be used to derive the encryption key. A more sophisticated key management system (e.g., HashiCorp Vault) is out of scope for the demo.

---

### 5. Glossary

| Term | Definition |
| :--- | :--- |
| **AES-256** | Advanced Encryption Standard with a 256-bit key, used for encrypting files at rest. |
| **Client-Side Encryption** | The process of encrypting data on the user's device before it is sent to the server. |
| **Docker Compose** | A tool for defining and running multi-container Docker applications. |
| **HTTPS / TLS** | Hypertext Transfer Protocol Secure / Transport Layer Security. The protocol for secure communication over a computer network. |
| **Minimum Viable Product (MVP)** | A version of a new product with just enough features to be usable and demonstrate core functionality. |
| **Web Crypto API** | A JavaScript API for performing cryptographic operations in a web browser. |