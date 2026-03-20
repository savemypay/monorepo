import logging
import os
import uuid
from typing import BinaryIO

import boto3
from botocore.exceptions import BotoCoreError, ClientError

from app.core.config import (
    AWS_S3_ACCESS_KEY_ID,
    AWS_REGION,
    AWS_S3_SECRET_ACCESS_KEY,
    AWS_SESSION_TOKEN,
    S3_BUCKET,
    S3_PUBLIC_BASE_URL,
)

logger = logging.getLogger(__name__)


def _get_s3_client():
    client_kwargs = {"region_name": AWS_REGION}
    if AWS_S3_ACCESS_KEY_ID and AWS_S3_SECRET_ACCESS_KEY:
        client_kwargs["aws_access_key_id"] = AWS_S3_ACCESS_KEY_ID
        client_kwargs["aws_secret_access_key"] = AWS_S3_SECRET_ACCESS_KEY
        if AWS_SESSION_TOKEN:
            client_kwargs["aws_session_token"] = AWS_SESSION_TOKEN
    return boto3.client("s3", **client_kwargs)


def _build_object_key(prefix: str, filename: str) -> str:
    safe_name = os.path.basename(filename or "upload.bin").replace(" ", "_")
    return f"{prefix}/{uuid.uuid4()}-{safe_name}"


def _build_public_url(key: str) -> str:
    if S3_PUBLIC_BASE_URL:
        return f"{S3_PUBLIC_BASE_URL.rstrip('/')}/{key}"
    return f"https://{S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{key}"


def generate_presigned_upload(filename: str, content_type: str) -> dict:
    if not S3_BUCKET:
        raise ValueError("S3_BUCKET is not configured")

    key = _build_object_key("ads", filename)
    client = _get_s3_client()
    try:
        url = client.generate_presigned_url(
            ClientMethod="put_object",
            Params={"Bucket": S3_BUCKET, "Key": key, "ContentType": content_type},
            ExpiresIn=900,
        )
    except (ClientError, BotoCoreError) as exc:
        logger.exception("Failed to create presigned URL: %s", exc)
        raise

    public_url = _build_public_url(key)
    return {"upload_url": url, "key": key, "public_url": public_url}


def upload_fileobj(fileobj: BinaryIO, *, filename: str, content_type: str, prefix: str = "ads") -> dict:
    if not S3_BUCKET:
        raise ValueError("S3_BUCKET is not configured")

    key = _build_object_key(prefix, filename)
    client = _get_s3_client()
    try:
        fileobj.seek(0)
        client.upload_fileobj(
            Fileobj=fileobj,
            Bucket=S3_BUCKET,
            Key=key,
            ExtraArgs={"ContentType": content_type},
        )
    except (ClientError, BotoCoreError) as exc:
        logger.exception("Failed to upload file to S3: %s", exc)
        raise

    return {"key": key, "public_url": _build_public_url(key)}


def delete_s3_objects(keys: list[str]) -> None:
    if not keys:
        return
    if not S3_BUCKET:
        raise ValueError("S3_BUCKET is not configured")

    client = _get_s3_client()
    try:
        client.delete_objects(
            Bucket=S3_BUCKET,
            Delete={"Objects": [{"Key": key} for key in keys], "Quiet": True},
        )
    except (ClientError, BotoCoreError) as exc:
        logger.exception("Failed to delete S3 objects: %s", exc)
        raise
