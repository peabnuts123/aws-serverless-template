# Cloudfront distribution
#   Woah boy cloudfront sure needs a loooooot of configuration!
resource "aws_cloudfront_distribution" "app" {
  enabled = true

  # Domain names that will be pointing at this distribution,
  #   other than the auto-generated "______.cloudfront.net"
  aliases = var.domain_name != null ? ["${var.domain_name}"] : null

  # Default file to serve when requesting `/`
  default_root_object = "index.html"

  # Description
  comment = "Project: '${var.project_id}' - Environment: '${var.environment_id}'"

  # Pricing tier - see https://aws.amazon.com/cloudfront/pricing/ for details
  # Basically just US / Canada - should be faster to provision
  #   PriceClass_100 takes about ~20m to geo-replicate
  #   PriceClass_All takes about ~45m to geo-replicate
  price_class = "PriceClass_100"

  # WWW
  origin {
    domain_name = module.www.s3_bucket_endpoint
    origin_id   = local.www_origin_id

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # API
  origin {
    domain_name = module.api.invoke_url
    origin_id   = local.api_origin_id

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Cache config for WWW
  default_cache_behavior {
    allowed_methods        = ["HEAD", "GET", "OPTIONS"]
    cached_methods         = ["HEAD", "GET"]
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    target_origin_id       = local.www_origin_id

    # Cache retention (disabled)
    default_ttl = 0
    min_ttl     = 0
    max_ttl     = 0

    # Forward nothing but request path to origin
    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.wwwproxy.arn
    }
  }

  # Cache disabled for API
  ordered_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["HEAD", "GET"]
    path_pattern           = "/api/*"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    target_origin_id       = local.api_origin_id

    # Cache retention (disabled)
    default_ttl = 0
    min_ttl     = 0
    max_ttl     = 0

    # Forward everything in the URL to origin
    forwarded_values {
      query_string = true

      cookies {
        forward = "all"
      }
    }
  }

  // Cache fingerprinted assets
  ordered_cache_behavior {
    allowed_methods        = ["HEAD", "GET", "OPTIONS"]
    cached_methods         = ["HEAD", "GET"]
    path_pattern           = "/_next/*"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    target_origin_id       = local.www_origin_id

    # Cache retention (5 minutes)
    default_ttl = 300
    min_ttl     = 0
    max_ttl     = 300

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
  }

  # Access restrictions
  # No restrictions, these are required fields
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # HTTPS certificate (from ACM)
  viewer_certificate {
    # @NOTE only used if `domain_name` is null
    cloudfront_default_certificate = var.domain_name != null ? null : true

    # @NOTE only used if `domain_name` is specified
    acm_certificate_arn      = var.domain_name != null ? data.aws_acm_certificate.default[0].arn : null
    ssl_support_method       = var.domain_name != null ? "sni-only" : null
    minimum_protocol_version = var.domain_name != null ? "TLSv1.2_2018" : null
  }
}

# Cloudfront function - www-proxy
resource "aws_cloudfront_function" "wwwproxy" {
  name    = local.wwwproxy_function.name
  runtime = "cloudfront-js-1.0"
  code    = <<-CODE
    /* dummy handler, for provisioning only. */
    function handler(event) {
      return event.request;
    }
  CODE

  lifecycle {
    # Ignore independently deployed changes to code
    ignore_changes = [
      code,
      comment,
    ]
  }
}