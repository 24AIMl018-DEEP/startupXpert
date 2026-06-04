from pydantic import BaseModel


class PitchState(BaseModel):
    startup_name: str
    pitch_text: str
    pitch_length: int
    indexed_chunks: int
