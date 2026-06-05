import json
from typing import Dict, List


def build_limited_json(json_fields: List[str], startup_data: Dict) -> str:
    return json.dumps({k: startup_data[k] for k in json_fields if k in startup_data}, indent=2)
