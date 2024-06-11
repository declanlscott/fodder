# Fodder

## Motivation

A few years ago, a certain midwestern fast-food restaurant chain discontinued its mobile app. I used their app for one specific reason: to check the **F**lavor **O**f the **D**ay (FOD). While their website still provides this information, I found it to be too slow and cumbersome for this one purpose. This motivated me to create an app with the goal of providing a simpler and faster user experience.

## Running Locally

### Prerequisites

- Required
  - [Node.js](https://nodejs.org/en)
  - [pnpm](https://pnpm.io)
- Optional
  - [AWS CLI](https://aws.amazon.com/cli/)
  - [Terraform](https://www.terraform.io/)
  - [LLRT](https://github.com/awslabs/llrt)

### Setup

Clone the repository and install dependencies:

```bash
git clone git@github.com:declanlscott/fodder.git
cd fodder
pnpm i
```

Create the necessary environment files:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

Build the monorepo packages and start the dev servers:

```bash
pnpm --filter "@repo/*" build
pnpm dev
```

### GitHub Actions

GitHub Actions authenticates with AWS using OIDC. Be sure to have an identity provider and role set up with the necessary permissions and trust relationship. Below is an example of the necessary configurations.

#### IAM Identity Provider

- Type
  - OpenID Connect
- Provider URL
  - token.actions.githubusercontent.com
- Audience
  - sts.amazonaws.com

#### Role Trust Relationship

```json
{
  "Version": "2008-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<YOUR_ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:declanlscott/fodder:*"
        }
      }
    }
  ]
}
```

Don't forget to set the necessary [secrets](github-actions.secrets.example) and environment [variables](github-actions.variables) in GitHub Actions.

### Terraform

When running Terraform commands locally, you may need to set the `AWS_PROFILE` environment variable to the appropriate profile. For example:

```bash
AWS_PROFILE=dev terraform plan
```

## Technologies

- Infrastructure
  - Terraform IaC
  - Cloudflare DNS
  - AWS
    - CloudFront
    - ACM
    - S3
    - Lambda
    - CloudWatch (for logs)
    - DynamoDB (for terraform state)
    - IAM
- Backend
  - Hono
  - TypeScript
  - LLRT (Low Latency Runtime)
  - Unit tests (with Vitest)
- Frontend
  - Vite
  - React
  - TypeScript
  - Tailwind CSS

```

## Architecture

![Architecture Diagram](architecture.png)
```
