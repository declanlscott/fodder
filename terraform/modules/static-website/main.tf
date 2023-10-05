resource "aws_s3_bucket" "fodder" {
  bucket = var.bucket_name
}

resource "aws_s3_bucket_versioning" "versioning" {
  bucket = aws_s3_bucket.fodder.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "block_public" {
  bucket = aws_s3_bucket.fodder.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

data "aws_iam_policy_document" "cloudfront_policy" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions = ["s3:GetObject"]

    resources = ["${aws_s3_bucket.fodder.arn}/*"]
  }
}

resource "aws_s3_bucket_policy" "bucket_policy" {
  bucket = aws_s3_bucket.fodder.bucket

  policy = data.aws_iam_policy_document.cloudfront_policy.json
}

resource "aws_s3_bucket_website_configuration" "website_config" {
  bucket = aws_s3_bucket.fodder.bucket

  index_document {
    suffix = "index.html"
  }
  error_document {
    key = "index.html"
  }
}
