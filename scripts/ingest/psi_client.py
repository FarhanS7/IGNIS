"""NASA Physical Sciences Informatics (PSI) API Client.

Provides typed interfaces for querying the NASA PSI Elasticsearch repository,
retrieving investigation metadata, and resolving presigned AWS S3 download URLs.
All network requests strictly use default system CA certificate verification.
"""

import json
import ssl
import sys
import urllib.parse
import urllib.request
from typing import Any, Dict, List, Optional

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) IGNIS-NASA-SpaceApps/2.0'
}

class PsiClient:
    """Client for NASA Physical Sciences Informatics (PSI) Geode API."""

    def __init__(self, base_url: str = "https://psi.nasa.gov"):
        self.base_url = base_url.rstrip('/')
        # Strict default TLS verification
        self.ssl_context = ssl.create_default_context()

    def search_investigations(self, query: str = "", size: int = 200) -> List[Dict[str, Any]]:
        """Query PSI Elasticsearch search endpoint."""
        url = f"{self.base_url}/geode-py/ws/repo/search?size={size}"
        if query:
            url += f"&q={urllib.parse.quote(query)}"
        
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, context=self.ssl_context, timeout=30) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return [h['_source'] for h in data.get('hits', {}).get('hits', [])]

    def get_investigation_metadata(self, accession: str) -> Dict[str, Any]:
        """Fetch complete metadata document for an investigation accession (e.g. PSI-25)."""
        url = f"{self.base_url}/geode-py/ws/repo/investigations/{accession}"
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, context=self.ssl_context, timeout=30) as resp:
            return json.loads(resp.read().decode('utf-8'))

    def get_presigned_download_url(self, accession: str, filename: str, version: int = 1) -> str:
        """Resolve presigned AWS S3 download URL from the PSI studies download endpoint."""
        params = urllib.parse.urlencode({
            'file': filename,
            'version': str(version),
            'redirect': 'false'
        })
        url = f"{self.base_url}/geode-py/ws/studies/{accession}/download?{params}"
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, context=self.ssl_context, timeout=30) as resp:
            s3_url = resp.read().decode('utf-8').strip()
            if s3_url.startswith('http'):
                return s3_url
            raise ValueError(f"Endpoint did not return an HTTP presigned URL: {s3_url[:200]}")
