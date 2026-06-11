# Docker & Kubernetes Installation Scripts

Complete automated setup for Docker and Kubernetes installation.

## Scripts Overview

### 1. **setup_docker_k8s.sh** (Main Orchestrator)
The primary installation script that manages the complete setup process.

**Features:**
- Interactive menu for selective installation
- Automatic requirement checking
- Progress feedback with colored output
- Post-installation verification
- Support for automated setup (non-interactive mode)

**Usage:**
```bash
# Interactive mode
./scripts/setup_docker_k8s.sh

# The script will ask if you want to skip the menu and install both
```

### 2. **install_docker.sh** (Docker Installation)
Automated Docker installation with support for multiple Linux distributions.

**Features:**
- Auto-detects operating system (Ubuntu, Debian, RHEL, CentOS, Fedora, Arch)
- Installs Docker Engine, CLI, and Docker Compose
- Configures Docker service for auto-start
- Adds current user to docker group
- Verification with hello-world container

**Supported OS:**
- Ubuntu/Debian
- RHEL/CentOS/Fedora
- Arch Linux/Manjaro

**Usage:**
```bash
./scripts/install_docker.sh
```

**After Installation:**
```bash
# Option 1: Log out and log back in
# Option 2: Apply group changes immediately
newgrp docker

# Verify installation
docker run hello-world
```

### 3. **install_kubernetes.sh** (Kubernetes Installation)
Flexible Kubernetes installation with multiple component options.

**Features:**
- Supports multiple Kubernetes distributions
- Installable components:
  - **kubectl** - Kubernetes command-line client
  - **Minikube** - Local Kubernetes cluster
  - **kubeadm** - Production-style cluster setup
  - **containerd** - Container runtime
  - **Helm** - Kubernetes package manager
  
**Installation Options:**
```
1) kubectl only (client only)
2) kubectl + Minikube (for local development)
3) kubectl + kubeadm (for cluster setup)
4) Full setup (kubectl, kubeadm, containerd, helm)
5) Install all options
```

**Usage:**
```bash
./scripts/install_kubernetes.sh

# Select option when prompted
```

**For Local Development (Minikube):**
```bash
# Start Minikube cluster
minikube start

# Check cluster status
kubectl cluster-info
kubectl get nodes

# Stop cluster
minikube stop
```

**For Production Cluster (kubeadm):**
```bash
# Initialize master node
sudo kubeadm init --pod-network-cidr=10.244.0.0/16

# Set up kubeconfig
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# Join worker nodes with the token from init output
```

## Quick Start

### For Standard Linux Systems

#### Option 1: Interactive Installation
```bash
cd /workspace
./scripts/setup_docker_k8s.sh
```

Then select:
- 1 for Docker only
- 2 for Kubernetes only
- 3 for both Docker and Kubernetes

#### Option 2: Automated Installation (No Menu)
```bash
cd /workspace
./scripts/setup_docker_k8s.sh
# When prompted, answer 'y' to skip the menu
```

#### Option 3: Install Individual Components
```bash
# Docker only
./scripts/install_docker.sh

# Kubernetes only (choose components interactively)
./scripts/install_kubernetes.sh
```

### For Dev Container Environments (GitHub Codespaces, VS Code Dev Containers)

First, install Docker and Kubernetes using the standard setup:

```bash
./scripts/setup_docker_k8s.sh
# Follow the prompts
```

Then initialize Docker daemon:

```bash
./scripts/init_docker_devcontainer.sh
```

This will:
- Start the Docker daemon properly without systemd
- Handle socket initialization
- Set up user permissions
- Verify Docker functionality

## System Requirements

- **OS:** Ubuntu, Debian, RHEL, CentOS, Fedora, or Arch Linux
- **Environment:** Standard Linux system OR Dev Container (GitHub Codespaces, VS Code Dev Containers, etc.)
- **RAM:** 2GB minimum (4GB+ recommended for Kubernetes)
- **Disk Space:** 5GB+ free space
- **Permissions:** Current user can run sudo commands
- **Network:** Internet connection for downloads

### Dev Container Specific Requirements
- Docker socket access (usually `/var/run/docker.sock`)
- Sufficient container resources (CPU, Memory, Disk)
- Access to systemd or service command

## Post-Installation Configuration

### Docker Configuration
```bash
# Test Docker
docker run hello-world

# Enable Docker for non-root user
# (Already done by script, may need to log out/in)
newgrp docker

# Basic Docker commands
docker ps
docker images
docker run -d nginx
```

### Kubernetes Configuration

#### For Minikube:
```bash
# Start Minikube
minikube start

# Check Kubernetes cluster
kubectl cluster-info
kubectl get nodes
kubectl get pods --all-namespaces

# Dashboard
minikube dashboard

# Stop Minikube
minikube stop
```

#### For kubeadm:
```bash
# Verify cluster
kubectl cluster-info
kubectl get nodes
kubectl get pods --all-namespaces

# Check node status
kubectl describe node <node-name>
```

## Troubleshooting

### Docker Issues

#### Standard Linux Systems
```bash
# Check Docker service status
sudo systemctl status docker

# Restart Docker
sudo systemctl restart docker

# View Docker logs
sudo journalctl -u docker -n 50

# Test Docker daemon
docker run hello-world
```

#### Dev Container Environments
```bash
# Check if Docker socket exists
ls -la /var/run/docker.sock

# Check Docker daemon logs
sudo tail -f /tmp/dockerd.log

# Restart Docker daemon
sudo pkill -f dockerd
./scripts/init_docker_devcontainer.sh

# Verify Docker is running
docker ps

# If docker command fails, try with sudo
sudo docker ps
```

### Kubernetes Issues
```bash
# Check kubectl configuration
kubectl config view

# Test cluster connectivity
kubectl cluster-info

# Check system pods
kubectl get pods -n kube-system

# View kubelet logs (kubeadm setup)
sudo journalctl -u kubelet -n 50
```

### Group Membership Issues
If Docker commands still require sudo after installation:
```bash
# Check if user is in docker group
id -nG | grep docker

# Manually add user (if needed)
sudo usermod -aG docker $USER

# Apply group changes
newgrp docker
```

## Security Notes

1. **Docker Group Warning:** Users in the docker group have root-equivalent access
2. **sudo Requirement:** Installation requires sudo privileges but not root login
3. **Network Security:** Ensure secure networks for production Kubernetes clusters
4. **Registry Security:** Use private registries for sensitive container images

## Dev Container Environment

If you're running this in a **dev container** (GitHub Codespaces, VS Code Dev Containers, etc.), use the specialized initialization script:

```bash
./scripts/init_docker_devcontainer.sh
```

**What this script does:**
- Detects dev container environment
- Starts Docker daemon properly without systemd
- Handles Docker socket initialization
- Manages user permissions for Docker access
- Provides troubleshooting for connection issues

**Dev Container Notes:**
- systemd is disabled by default for performance
- Docker daemon must be started manually or via script
- Uses `service` command instead of `systemctl`
- Docker socket location: `/var/run/docker.sock`

## File Structure

```
/workspace/scripts/
├── install_docker.sh              # Docker installation script
├── install_kubernetes.sh          # Kubernetes installation script
├── setup_docker_k8s.sh            # Main orchestrator script
├── init_docker_devcontainer.sh    # Dev container Docker initialization
└── SETUP_GUIDE.md                # This file
```

## Environment Detection

The scripts automatically detect:
- **OS:** Ubuntu, Debian, Fedora, RHEL, CentOS, Arch, Manjaro
- **Architecture:** AMD64, ARM64, or other
- **Version:** Specific OS version for appropriate package repositories

## Uninstall (If Needed)

### Uninstall Docker
```bash
# Ubuntu/Debian
sudo apt-get remove docker-ce docker-ce-cli containerd.io
sudo apt-get purge docker-ce docker-ce-cli containerd.io

# Clean up
sudo rm -rf /var/lib/docker
```

### Uninstall Kubernetes
```bash
# kubeadm cleanup
sudo kubeadm reset

# Remove packages
sudo apt-get remove kubelet kubeadm kubectl

# Remove configuration
rm -rf ~/.kube
```

## Additional Resources

- **Docker Documentation:** https://docs.docker.com/
- **Kubernetes Documentation:** https://kubernetes.io/docs/
- **Minikube Documentation:** https://minikube.sigs.k8s.io/
- **kubeadm Documentation:** https://kubernetes.io/docs/reference/setup-tools/kubeadm/
- **Helm Documentation:** https://helm.sh/docs/

## License & Support

These scripts are part of the money-keeper project. For issues or improvements, refer to the project repository.
