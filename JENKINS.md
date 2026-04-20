# Jenkins CI/CD Setup Guide

This guide explains how to set up and run Jenkins for the PO Generator project using Docker.

---

## 🚀 1. Run Jenkins with Docker Compose

We provide a pre-configured Jenkins setup that can run Docker commands inside its pipeline.

```bash
# Navigate to the jenkins directory
cd jenkins

# Build and start Jenkins
docker-compose up -d
```

### Accessing Jenkins:
- **URL:** [http://localhost:8080](http://localhost:8080)
- **Initial Admin Password:**
  - Run this command to get the password:
    ```bash
    docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
    ```

---

## 🛠️ 2. Jenkins Configuration

After logging in, follow these steps:

### A. Install Required Plugins
Go to **Manage Jenkins** → **Plugins** → **Available Plugins** and install:
1. `Docker Pipeline`
2. `Kubernetes CLI` (if deploying to K8s)
3. `Git` (usually pre-installed)

### B. Configure Credentials
Go to **Manage Jenkins** → **Credentials** → **System** → **Global credentials**:

1. **Docker Hub Credentials**:
   - **ID:** `docker-hub-credentials` (matches `Jenkinsfile`)
   - **Type:** Username with password
   - **Username:** Your Docker Hub username
   - **Password:** Your Docker Hub password/token

2. **Kubeconfig** (Optional, for Kubernetes deployment):
   - **ID:** `kubeconfig` (matches `Jenkinsfile`)
   - **Type:** Secret file
   - **File:** Your `~/.kube/config` content

---

## 🔄 3. Create the Pipeline Job

1. Click **New Item** in Jenkins.
2. Enter name: `po-generator-pipeline`.
3. Select **Pipeline** and click **OK**.
4. Under **Pipeline** section:
   - **Definition:** `Pipeline script from SCM`
   - **SCM:** `Git`
   - **Repository URL:** [Path to your repo or local directory]
   - **Script Path:** `Jenkinsfile`
5. Click **Save**.

---

## 📝 4. Update Jenkinsfile Environment

Make sure to edit the `Jenkinsfile` in the root directory to match your Docker Hub username:

```groovy
environment {
    DOCKER_REGISTRY = "your-docker-username"
    // ...
}
```

---

> [!IMPORTANT]
> **Docker Socket Permissions**
> On Linux, the Jenkins container needs permission to access `/var/run/docker.sock`. If you get a "permission denied" error, run:
> `sudo chmod 666 /var/run/docker.sock` on your host machine.

> [!TIP]
> **Pipeline Stages**
> The provided [Jenkinsfile](../Jenkinsfile) handles:
> 1. **Checkout**: Pulling source code.
> 2. **Backend**: Building and pushing the backend Docker image.
> 3. **Frontend**: Building and pushing the frontend Docker image.
> 4. **Deploy**: Updating Kubernetes manifests and applying them.
