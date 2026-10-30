from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.models import TransactionModel
from app.schemas.schemas import TransactionResponse

router = APIRouter(prefix="/transactions", tags=["Transactions & Financial Conduits"])

@router.get("", response_model=List[TransactionResponse])
def get_transactions(
    min_amount: Optional[float] = 0.0,
    is_flagged: Optional[bool] = None,
    source_id: Optional[str] = None,
    target_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(TransactionModel)
    if min_amount and min_amount > 0:
        query = query.filter(TransactionModel.amount_usd >= min_amount)
    if is_flagged is not None:
        query = query.filter(TransactionModel.is_flagged == is_flagged)
    if source_id:
        query = query.filter(TransactionModel.source_id == source_id)
    if target_id:
        query = query.filter(TransactionModel.target_id == target_id)
    return query.all()

@router.get("/anomalies", response_model=List[TransactionResponse])
def get_flagged_anomalies(db: Session = Depends(get_db)):
    return db.query(TransactionModel).filter(TransactionModel.is_flagged == True).all()
