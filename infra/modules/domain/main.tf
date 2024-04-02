terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "4.28.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

provider "aws" {
  alias  = "virginia"
  region = "us-east-1"
}

locals {
  domain_name = "${var.subdomain}.${var.root_domain_name}"
}

resource "aws_acm_certificate" "cert" {
  domain_name       = local.domain_name
  validation_method = "DNS"
  provider          = aws.virginia

  lifecycle {
    create_before_destroy = true
  }
}

resource "cloudflare_record" "subdomain" {
  zone_id = var.cloudflare_zone_id

  name    = var.subdomain
  type    = "CNAME"
  value   = var.cloudfront_distribution_domain_name
  proxied = true
}

resource "cloudflare_record" "validation" {
  zone_id = var.cloudflare_zone_id

  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  name  = each.value.name
  type  = each.value.type
  value = each.value.record
}

resource "aws_acm_certificate_validation" "validation" {
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for record in cloudflare_record.validation : record.hostname]
  provider                = aws.virginia
}
