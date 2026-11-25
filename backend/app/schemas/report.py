from pydantic import BaseModel
from datetime import datetime

class ReportResponse(BaseModel):
    id: int
    document_id: int
    report_type: str
    file_path: str
    download_url: str
    created_at: datetime

    class Config:
        from_attributes = True
