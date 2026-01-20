# Money Manager – Personal Finance Tracker 

A secure and scalable **personal finance tracker backend** built using **Spring Boot**.
Supports **Income/Expense tracking, category management, dashboard analytics**, and enterprise-ready features like **JWT auth + refresh token**, **password reset**, and **Excel report exports**.

---

## Tech Stack

* **Language:** Java 
* **Framework:** Spring Boot 
* **Security:** Spring Security, JWT (Access Token + Refresh Token)
* **Database:** MySQL
* **ORM:** Spring Data JPA (Hibernate)
* **Mailing:** Spring Mail
* **Reports:** Apache POI (Excel export)
* **Build Tool:** Maven

---

## Features

### Authentication & Security

* JWT-based **stateless authentication**
* **DB-backed refresh token system** with **HttpOnly cookies**
* Secure login/logout and token renewal flow

### Finance Management

* CRUD APIs for:
  * **Auth**
  * **Income**
  * **Expense**
  * **Category**
  * **Profile**
* User-scoped data access (no cross-user leakage)

### Transaction Listing (Advanced APIs)

* **Date range filtering**
* **Keyword search**
* **Sorting** (Asc/Desc)

### Dashboard & Analytics

* Aggregated summary APIs:

  * Total balance
  * Total income
  * Total expense
  * Recent transactions

### Password Reset Workflow

* Secure **Forgot Password / Reset Password**
* Token generation + validation
* Server-side validation and token invalidation

### Reports & Export

* **Excel report generation** for income/expense
* Download Excel reports via API
* Email Excel reports as attachments via Spring Mail

---
