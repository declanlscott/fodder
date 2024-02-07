resource "aws_cloudfront_distribution" "distribution" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  origin {
    origin_id = var.restaurant_lambda_function_name
    // Remove `https://` and trailing `/` from the function url endpoint
    domain_name = replace(replace(var.restaurant_lambda_function_url, "https://", ""), "/", "")

    custom_origin_config {
      https_port             = 443
      http_port              = 80
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  origin {
    origin_id = var.restaurants_lambda_function_name
    // Remove `https://` and trailing `/` from the function url endpoint
    domain_name = replace(replace(var.restaurants_lambda_function_url, "https://", ""), "/", "")

    custom_origin_config {
      https_port             = 443
      http_port              = 80
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  origin {
    origin_id = var.flavor_lambda_function_name
    // Remove `https://` and trailing `/` from the function url endpoint
    domain_name = replace(replace(var.flavor_lambda_function_url, "https://", ""), "/", "")

    custom_origin_config {
      https_port             = 443
      http_port              = 80
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  origin {
    origin_id = var.flavors_lambda_function_name
    // Remove `https://` and trailing `/` from the function url endpoint
    domain_name = replace(replace(var.flavors_lambda_function_url, "https://", ""), "/", "")

    custom_origin_config {
      https_port             = 443
      http_port              = 80
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  origin {
    origin_id = var.static_website_bucket_id
    // Remove `http://` from the website endpoint
    domain_name = replace(var.static_website_bucket_website_endpoint, "http://", "")

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/api/restaurants/*"
    target_origin_id       = var.restaurant_lambda_function_name
    viewer_protocol_policy = "https-only"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]

    cache_policy_id = aws_cloudfront_cache_policy.restaurant.id
  }

  ordered_cache_behavior {
    path_pattern           = "/api/restaurants"
    target_origin_id       = var.restaurants_lambda_function_name
    viewer_protocol_policy = "https-only"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]

    cache_policy_id = aws_cloudfront_cache_policy.restaurants.id
  }

  ordered_cache_behavior {
    path_pattern           = "/api/flavors/*"
    target_origin_id       = var.flavor_lambda_function_name
    viewer_protocol_policy = "https-only"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]

    cache_policy_id = aws_cloudfront_cache_policy.flavor.id
  }

  ordered_cache_behavior {
    path_pattern           = "/api/flavors"
    target_origin_id       = var.flavors_lambda_function_name
    viewer_protocol_policy = "https-only"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]

    cache_policy_id = aws_cloudfront_cache_policy.flavors.id
  }

  default_cache_behavior {
    target_origin_id       = var.static_website_bucket_id
    viewer_protocol_policy = "https-only"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]

    cache_policy_id = aws_cloudfront_cache_policy.default.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "whitelist"
      locations        = ["US"]
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  aliases = var.aliases
}

resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "Fodder origin access control"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_cache_policy" "restaurant" {
  name    = "fodder-restaurant-cache-policy"
  min_ttl = 0
  max_ttl = 86400

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

resource "aws_cloudfront_cache_policy" "restaurants" {
  name    = "fodder-restaurants-cache-policy"
  min_ttl = 0
  max_ttl = 86400

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

resource "aws_cloudfront_cache_policy" "flavor" {
  name    = "fodder-flavor-cache-policy"
  min_ttl = 0
  max_ttl = 86400

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

resource "aws_cloudfront_cache_policy" "flavors" {
  name    = "fodder-flavors-cache-policy"
  min_ttl = 0
  max_ttl = 86400

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

resource "aws_cloudfront_cache_policy" "default" {
  name        = "fodder-default-cache-policy"
  min_ttl     = 0
  default_ttl = 3600
  max_ttl     = 86400

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }
  }
}
