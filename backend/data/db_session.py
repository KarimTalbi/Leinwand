import os

from dotenv import load_dotenv
from sqlmodel import Session, create_engine, SQLModel

load_dotenv()

USER = os.getenv("DB_USER")
NAME = os.getenv("DB_NAME")
PASS = os.getenv("DB_PASS")
HOST = os.getenv("DB_HOST")
PORT = os.getenv("DB_PORT")


DATABASE_URL = f"postgresql+psycopg2://{USER}:{PASS}@{HOST}:{PORT}/{NAME}?sslmode=require"
engine = create_engine(DATABASE_URL, echo=False)

def get_session():
    with Session(engine) as session:
        yield session

def get_db():
   return Session(engine)

#def init_db():
#    SQLModel.metadata.drop_all(bind=engine)
#    SQLModel.metadata.create_all(bind=engine)

# init_db()