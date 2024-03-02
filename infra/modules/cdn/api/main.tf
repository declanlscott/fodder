resource "aws_cloudfront_distribution" "api" {
  origin {
    // Remove `https://` and trailing `/` from the function url endpoint
    domain_name = replace(replace(var.function_url, "https://", ""), "/", "")
    origin_id   = var.function_name

    custom_origin_config {
      https_port             = 443
      http_port              = 80
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled         = true
  is_ipv6_enabled = true

  default_cache_behavior {
    target_origin_id       = var.function_name
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]

    cache_policy_id            = aws_cloudfront_cache_policy.api.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.api.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "whitelist"
      locations        = ["US"]
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  aliases = [var.api_domain_name]
}

resource "aws_cloudfront_cache_policy" "api" {
  name        = "fodder-api-cache-policy"
  min_ttl     = 0
  default_ttl = 3600
  max_ttl     = 3600

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "whitelist"
      query_strings {
        items = ["address", "latitude", "longitude"]
      }
    }
  }
}

resource "aws_cloudfront_response_headers_policy" "api" {
  name = "fodder-api-response-headers-policy"

  cors_config {
    access_control_allow_credentials = false

    access_control_allow_headers {
      items = ["*"]
    }

    access_control_allow_methods {
      items = ["GET"]
    }

    access_control_allow_origins {
      items = [var.cors_origin]
    }

    origin_override = false
  }
}
