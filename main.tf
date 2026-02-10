terraform {
  required_providers {
    cloudflare = {
    source  = "cloudflare/cloudflare"
    version = "~> 4.0"
   }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

variable "cloudflare_api_token" {
    description = "Cloudflare API Token"
    type         = string
    sensitive    = true
}

variable "zone_id" {
    description = "Cloudflare Zone ID"
    type        = string
}

resource "cloudflare_record" "example" {
    zone_id = var.zone_id
    name    = "test"
    value   = "1.1.1.1"
    type    = "A"
    ttl     = 300
    proxied = false
}