import logging
import uuid

import boto3
from botocore.exceptions import BotoCoreError, ClientError

from app.core.config import AWS_REGION, S3_BUCKET, S3_PUBLIC_BASE_URL

logger = logging.getLogger(__name__)


def generate_presigned_upload(filename: str, content_type: str) -> dict:
    if not S3_BUCKET:
        raise ValueError("S3_BUCKET is not configured")

    key = f"ads/{uuid.uuid4()}-{filename}"
    client = boto3.client("s3", region_name=AWS_REGION)
    try:
        url = client.generate_presigned_url(
            ClientMethod="put_object",
            Params={"Bucket": S3_BUCKET, "Key": key, "ContentType": content_type},
            ExpiresIn=900,
        )
    except (ClientError, BotoCoreError) as exc:
        logger.exception("Failed to create presigned URL: %s", exc)
        raise

    public_url = f"{S3_PUBLIC_BASE_URL.rstrip('/')}/{key}" if S3_PUBLIC_BASE_URL else None
    return {"upload_url": url, "key": key, "public_url": public_url}
