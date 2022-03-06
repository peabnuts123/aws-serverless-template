# RESOURCES
# S3 Bucket
resource "aws_s3_bucket" "www" {
  bucket = local.s3_bucket_name
  force_destroy = true
}

# Static site hosting / redirects
resource "aws_s3_bucket_website_configuration" "www" {
  bucket = aws_s3_bucket.www.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "404/index.html"
  }
}

resource "aws_s3_bucket_acl" "www" {
  bucket = aws_s3_bucket.www.id
  acl    = "public-read"
}
