variable "project_id" {
  description = "The GCP Project ID"
  type        = string
}

variable "region" {
  description = "The GCP Region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "The deployment environment (staging or prod)"
  type        = string
  default     = "staging"
}

variable "app_name" {
  description = "The application name"
  type        = string
  default     = "coverbots"
}
