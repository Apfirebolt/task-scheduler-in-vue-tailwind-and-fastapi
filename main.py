from fastapi import FastAPI, BackgroundTasks, Request, status
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from backend.tasks import router as task_router

app = FastAPI(title="Fast API Scheduler",
    docs_url="/docs",
    version="0.0.1",
    redirect_slashes=False)

origins = ["http://localhost:8080","http://127.0.0.1:8080","http://localhost:3000",]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(task_router.router)


def write_notification(email: str, message=""):
    with open("log.txt", mode="w") as email_file:
        content = f"notification for {email}: {message}"
        email_file.write(content)


@app.post("/send-notification/{email}")
async def send_notification(email: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(write_notification, email, message="some notification from the back-ground task")
    return {"message": "Notification sent in the background"}


# app.mount("/client", StaticFiles(directory="client/dist"), name="static")

# templates = Jinja2Templates(directory="client/dist")


# @app.get("/{full_path:path}")
# async def serve_vue_app(request: Request, full_path: str):
#     """Serve the vue app bootstrapped by Vite
#     """
#     return templates.TemplateResponse("index.html", {"request": request})


# @app.get("/")
# async def root():
#     return {"message": "Hello World"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)




    
