from fastapi import FastAPI, BackgroundTasks, Request, status
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import uvicorn

from backend.tasks import router as task_router
from backend.auth import router as auth_router

app = FastAPI(title="Fast API Scheduler",
    docs_url="/docs",
    version="0.0.1")

origins = ["http://localhost:8080","http://localhost:3000",]

# Initialize the scheduler instance
scheduler = AsyncIOScheduler()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(task_router.router)
app.include_router(auth_router.router)

# --- CRON JOB TASK ---
def run_every_minute():
    """A function that will be executed by the scheduler every minute."""
    print(f"[CRON] Scheduler heartbeat running at: {datetime.now().isoformat()}")


@app.on_event("startup")
async def startup_event():
    """Start the scheduler when the FastAPI application starts up."""
    # Add the job: run the 'run_every_minute' function using cron syntax
    # cron="* * * * *" means: minute (0-59) hour (0-23) day(1-31) month(1-12) day_of_week(0-6 or mon-sun)
    scheduler.add_job(run_every_minute, 'cron', minute='*', id='minute_heartbeat')
    scheduler.start()
    print("✅ APScheduler started. Cron job running every minute.")


@app.on_event("shutdown")
def shutdown_event():
    """Stop the scheduler when the FastAPI application shuts down."""
    if scheduler.running:
        scheduler.shutdown()
        print("❌ APScheduler stopped.")



def write_notification(email: str, message=""):
    with open("log.txt", mode="w") as email_file:
        content = f"notification for {email}: {message}"
        email_file.write(content)


@app.post("/send-notification/{email}")
async def send_notification(email: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(write_notification, email, message="some notification from the back-ground task")
    return {"message": "Notification sent in the background"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)




    
