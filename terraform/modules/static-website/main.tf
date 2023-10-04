resource "aws_s3_bucket" "fodder" {
  bucket = var.bucket_name
}

resource "aws_s3_bucket_public_access_block" "unblock_public" {
  bucket = aws_s3_bucket.fodder.bucket

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_ownership_controls" "owner_preferred" {
  bucket = aws_s3_bucket.fodder.bucket

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "public_read" {
  bucket = aws_s3_bucket.fodder.bucket

  acl = "public-read"

  depends_on = [
    aws_s3_bucket_ownership_controls.owner_preferred,
    aws_s3_bucket_public_access_block.unblock_public
  ]
}

data "aws_iam_policy_document" "allow_read" {
  statement {
    effect = "Allow"

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    actions = ["s3:GetObject"]

    resources = ["${aws_s3_bucket.fodder.arn}/*"]
  }
}

resource "aws_s3_bucket_policy" "bucket_policy" {
  bucket = aws_s3_bucket.fodder.bucket

  policy = data.aws_iam_policy_document.allow_read.json
}

resource "aws_s3_bucket_website_configuration" "website_config" {
  bucket = aws_s3_bucket.fodder.bucket

  index_document {
    suffix = "index.html"
  }
  error_document {
    key = "index.html"
  }

  depends_on = [aws_s3_bucket_public_access_block.unblock_public]
}
