resource "aws_s3_bucket" "fodder_test_files" {
  bucket        = "fodder-test-files"
  force_destroy = true
}

resource "aws_s3_bucket_versioning" "fodder_test_files_bucket_versioning" {
  bucket = aws_s3_bucket.fodder_test_files.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "fodder_test_files_crypto_config" {
  bucket = aws_s3_bucket.fodder_test_files.bucket
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_object" "mock_responses" {
  bucket       = aws_s3_bucket.fodder_test_files.bucket
  key          = "mock-responses/"
  content_type = "application/x-directory"
  acl          = "private"
}
