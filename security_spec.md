# Security Specification for GCC Company App

## Data Invariants
1. A project must belong to a valid category.
2. Only authorized admins can write to `projects` or `admins`.
3. Everyone can read `projects`.
4. Only admins can read `admins`.
5. `createdAt` must be set only on creation and equal `request.time`.
6. `updatedAt` must be updated on every change and equal `request.time`.

## The Dirty Dozen Payloads (Rejection Targets)
1. **Unauth Project Creation**: Anonymous user tries to add a project.
2. **Admin Privilege Escalation**: Regular user tries to add themselves to `admins`.
3. **Invalid Category**: Admin tries to add a project with a category not in the enum.
4. **Timestamp Manipulation (Create)**: Admin tries to set `createdAt` to a past date.
5. **Timestamp Manipulation (Update)**: Admin tries to update a doc without updating `updatedAt`.
6. **Shadow Field Injection**: Admin tries to add `isFeatured: true` when it's not in the schema.
7. **Cross-User Admin Delete**: Admin tries to delete another admin (if we had specific ownership, but currently any admin can manage others).
8. **Malicious ID**: Attempting to create a project with a 2KB ID string.
9. **PII Blanket Read**: Trying to list all `admins` as a non-admin.
10. **Data Type Poisoning**: Sending `title: 123` (number) instead of string.
11. **Negative Duration**: Admin tries to set `duration: -5 days`.
12. **Missing Required Field**: Trying to create a project without an `image` URL.

## Admin Setup
Initial Admin: `mutaz2838@gmail.com`
