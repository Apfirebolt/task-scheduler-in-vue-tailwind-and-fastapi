from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from backend.tasks import router as task_router

app = FastAPI(title="Fast API Scheduler",
    docs_url="/docs",
    version="0.0.1")

origins = ["http://localhost:8080",]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(task_router.router)

# app.mount("/static", StaticFiles(directory="client/build/static"), name="static")

# templates = Jinja2Templates(directory="client/dist")


# @app.get("/{full_path:path}")
# async def serve_react_app(request: Request, full_path: str):
#     """Serve the react app
#     `full_path` variable is necessary to serve each possible endpoint with
#     `index.html` file in order to be compatible with `react-router-dom
#     """
#     return templates.TemplateResponse("index.html", {"request": request})


@app.get("/")
async def root():
    return {"message": "Hello World"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)