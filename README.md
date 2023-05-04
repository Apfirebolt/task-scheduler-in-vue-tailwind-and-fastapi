# Task Scheduler using Vue, Tailwind, Vite and Fast API

A task scheduler app which allows anonymous users to add tasks and view them in a custom calendar created using dayjs library.

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Vue.js](https://img.shields.io/badge/vuejs-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

## Tech Stack

The project back-end is created using Fast API in Python and Vue is used for the front-end. Tailwind CSS classes are used to style the UI components. For the database "Postgres" has been used.

## Introduction

It is a simple Kanban board application where you have four status 'To Do', 'In Progress', 'In Review' and 'Done'. You can create a generic task item and then through Kanban drag and drop dashboard, you can move items and save the updated status.

It has supoort for multi-user authentication.

## Updates

27/12/22 : Added Admin panel with support of being able to add users and tasks, modify any user or task for admin role user type.

## Screenshots

The style might be a subject to change in the future for this project. But, as of now this is how few pages look like

Add Task form.

![alt text](./screenshots/add_task.PNG)

Schduler which displays tasks in a calendar form.

![alt text](./screenshots/scheduler.png)

List of all tasks

![alt text](./screenshots/tasks.PNG)

Mobile menu view, a sidebar opens which displays menu items on smaller screens.

![alt text](./screenshots/mobile_menu.png)

## Deployment using Docker containers

To be done in future