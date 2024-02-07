resource "aws_s3_bucket" "fodder" {
  bucket = var.bucket_name
}

resource "aws_s3_bucket_website_configuration" "config" {
  bucket = aws_s3_bucket.fodder.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_versioning" "versioning" {
  bucket = aws_s3_bucket.fodder.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_ownership_controls" "owner_preferred" {
  bucket = aws_s3_bucket.fodder.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "bucket_acl" {
  depends_on = [aws_s3_bucket_ownership_controls.owner_preferred]

  bucket = aws_s3_bucket.fodder.id
  acl    = "private"
}

resource "aws_s3_bucket_public_access_block" "allow_public" {
  bucket = aws_s3_bucket.fodder.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}
