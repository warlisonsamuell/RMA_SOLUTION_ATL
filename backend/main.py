from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy import create_engine, Column, String, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Union
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import DateTime
from sqlalchemy.sql import func


SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:2002maria@127.0.0.1:3306/RMASOLUTION"


engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class User(Base):
    __tablename__ = 'users'
    
    matricula = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)

class RMARequest(Base):
    __tablename__ = 'rma_requests'
    
    id = Column(Integer, primary_key=True, index=True)
    produto = Column(String)
    defeito = Column(String)
    status = Column(String)
    usuario = Column(String) 
    createdAt = Column(DateTime, server_default=func.now())



class RegisterUser(BaseModel):
    matricula: str
    email: EmailStr
    password: str

class LoginData(BaseModel):
    matricula: str
    password: str

class RMARequestCreate(BaseModel):
    produto: str
    defeito: str
    status: str = "Pendente"
    usuario: str 


app = FastAPI()

# Definindo o OAuth2 para autenticação
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Configuração de segurança (hashing de senha)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configuração JWT
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Base.metadata.create_all(bind=engine)
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        matricula: str = payload.get("sub")
        if matricula is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        user = db.query(User).filter(User.matricula == matricula).first()
        if user is None:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")



##################### Rotas #####################

# Rota de registro de usuário
@app.post("/auth/register")
def register(user: RegisterUser, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.matricula == user.matricula).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Matrícula já existe")

    db_email = db.query(User).filter(User.email == user.email).first()
    if db_email:
        raise HTTPException(status_code=400, detail="E-mail já registrado")

    hashed_password = hash_password(user.password)

    new_user = User(matricula=user.matricula, email=user.email, password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "Usuário criado com sucesso"}

# Rota de login
@app.post("/auth/login")
def login(user: LoginData, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.matricula == user.matricula).first()
    
    if db_user is None or not verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas"
        )
    
    access_token = create_access_token(data={"sub": db_user.matricula})
    return {"access_token": access_token, "token_type": "bearer"}

# Rota de criação de RMA
@app.post("/rma/create")
def create_rma(request: RMARequestCreate, db: Session = Depends(get_db)):
    new_rma = RMARequest(produto=request.produto, defeito=request.defeito, status=request.status, usuario=request.usuario)
    db.add(new_rma)
    db.commit()
    db.refresh(new_rma)
    
    return {"message": "Solicitação de RMA registrada com sucesso!", "createdAt": new_rma.createdAt}

# Rota para obter as solicitações de RMA do usuário logado
@app.get("/rma/requests")
def get_user_rma_requests(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rmas = db.query(RMARequest).filter(RMARequest.usuario == current_user.matricula).all()
    return {"rma_requests": rmas}

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rota para obter o status das solicitações de RMA
@app.get("/rma/status")
def get_rma_status(db: Session = Depends(get_db)):
    rmas = db.query(RMARequest).all()
    status_count = {
        "pendente": sum(1 for rma in rmas if rma.status == "Pendente"),
        "recebida": sum(1 for rma in rmas if rma.status == "Recebida"),
        "em_teste": sum(1 for rma in rmas if rma.status == "Em Teste"),
        "concluida": sum(1 for rma in rmas if rma.status == "Concluída"),
    }
    return status_count

# Rota de métricas de RMA
@app.get("/rma/metrics")
def get_rma_metrics(db: Session = Depends(get_db)):
    rmas = db.query(RMARequest).all()
    
    # Contando os status
    status_count = {
        "pendente": sum(1 for rma in rmas if rma.status == "Pendente"),
        "recebida": sum(1 for rma in rmas if rma.status == "Recebida"),
        "em_teste": sum(1 for rma in rmas if rma.status == "Em Teste"),
        "concluida": sum(1 for rma in rmas if rma.status == "Concluída"),
    }

    # Calculando o tempo médio de cada etapa
    avg_time = {
        "pendente": calculate_average_time(rmas, "pendente"),
        "em_teste": calculate_average_time(rmas, "em_teste"),
        "concluida": calculate_average_time(rmas, "concluida"),
    }

    # Tipos de defeitos mais comuns
    defect_count = {}
    for rma in rmas:
        defect_count[rma.defeito] = defect_count.get(rma.defeito, 0) + 1
    
    return {
        "status_count": status_count,
        "avg_time": avg_time,
        "defect_count": defect_count
    }

def calculate_average_time(rmas, status):
    times = [rma.timestamp for rma in rmas if rma.status == status]
    if len(times) < 2:
        return 0
    time_diff = (max(times) - min(times)).total_seconds()
    return time_diff / len(times)
