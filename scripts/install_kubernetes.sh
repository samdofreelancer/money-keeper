#!/bin/bash

# Kubernetes Installation Script
# Automates installation of kubectl, minikube or kubeadm

set -e

echo "=================================================="
echo "Kubernetes Installation Script"
echo "=================================================="

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VERSION=$VERSION_ID
else
    echo "Cannot detect OS. Exiting."
    exit 1
fi

echo "Detected OS: $OS $VERSION"

# Function to detect architecture
get_arch() {
    local arch=$(uname -m)
    case $arch in
        x86_64)
            echo "amd64"
            ;;
        aarch64)
            echo "arm64"
            ;;
        *)
            echo "$arch"
            ;;
    esac
}

ARCH=$(get_arch)
echo "Detected Architecture: $ARCH"

# Function to install kubectl
install_kubectl() {
    echo "Installing kubectl..."
    
    case "$OS" in
        ubuntu|debian)
            sudo apt-get update
            sudo apt-get install -y apt-transport-https ca-certificates curl
            
            # Add Kubernetes repository
            curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.28/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
            echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.28/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
            
            sudo apt-get update
            sudo apt-get install -y kubectl
            ;;
        fedora|rhel|centos)
            sudo yum update -y
            cat <<EOF | sudo tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://pkgs.k8s.io/core:/stable:/v1.28/rpm/
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://pkgs.k8s.io/core:/stable:/v1.28/rpm/repodata/repomd.xml.key
EOF
            sudo yum install -y kubectl
            ;;
        arch|manjaro)
            sudo pacman -Syu --noconfirm
            sudo pacman -S --noconfirm kubectl
            ;;
        *)
            echo "Installing kubectl via binary for $OS"
            mkdir -p $HOME/bin
            curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/$ARCH/kubectl"
            chmod +x kubectl
            sudo mv kubectl /usr/local/bin/
            ;;
    esac
    
    echo "kubectl installed successfully!"
}

# Function to install Minikube (for local development)
install_minikube() {
    echo "Installing Minikube..."
    
    # Download minikube
    curl -LO https://github.com/kubernetes/minikube/releases/latest/download/minikube-linux-$ARCH
    chmod +x minikube-linux-$ARCH
    sudo mv minikube-linux-$ARCH /usr/local/bin/minikube
    
    # Install VirtualBox or KVM drivers (optional)
    case "$OS" in
        ubuntu|debian)
            sudo apt-get install -y virtualbox virtualbox-ext-pack
            ;;
        fedora|rhel|centos)
            sudo yum install -y VirtualBox
            ;;
        *)
            echo "Please install VirtualBox or KVM manually for Minikube"
            ;;
    esac
    
    echo "Minikube installed successfully!"
}

# Function to install kubeadm (for production-like setup)
install_kubeadm() {
    echo "Installing kubeadm, kubelet, and related tools..."
    
    case "$OS" in
        ubuntu|debian)
            sudo apt-get update
            sudo apt-get install -y apt-transport-https ca-certificates curl
            
            # Add Kubernetes repository
            curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.28/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
            echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.28/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
            
            sudo apt-get update
            sudo apt-get install -y kubelet kubeadm kubectl
            sudo apt-mark hold kubelet kubeadm kubectl
            ;;
        fedora|rhel|centos)
            sudo yum update -y
            cat <<EOF | sudo tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://pkgs.k8s.io/core:/stable:/v1.28/rpm/
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://pkgs.k8s.io/core:/stable:/v1.28/rpm/repodata/repomd.xml.key
EOF
            sudo yum install -y kubelet kubeadm kubectl
            sudo systemctl enable kubelet
            ;;
        *)
            echo "Please install kubeadm manually for your OS"
            ;;
    esac
    
    echo "kubeadm, kubelet installed successfully!"
}

# Function to install Helm (Kubernetes package manager)
install_helm() {
    echo "Installing Helm..."
    
    curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
    
    echo "Helm installed successfully!"
}

# Function to install containerd (CRI for Kubernetes)
install_containerd() {
    echo "Installing containerd..."
    
    case "$OS" in
        ubuntu|debian)
            sudo apt-get update
            sudo apt-get install -y containerd.io
            sudo mkdir -p /etc/containerd
            sudo containerd config default | sudo tee /etc/containerd/config.toml
            sudo systemctl restart containerd
            ;;
        fedora|rhel|centos)
            sudo yum install -y containerd.io
            sudo mkdir -p /etc/containerd
            sudo containerd config default | sudo tee /etc/containerd/config.toml
            sudo systemctl restart containerd
            ;;
        *)
            echo "Please install containerd manually for your OS"
            ;;
    esac
    
    echo "containerd installed successfully!"
}

# Menu for installation options
echo ""
echo "Select Kubernetes components to install:"
echo "1) kubectl only (client only)"
echo "2) kubectl + Minikube (for local development)"
echo "3) kubectl + kubeadm (for cluster setup)"
echo "4) Full setup (kubectl, kubeadm, containerd, helm)"
echo "5) Install all options"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        install_kubectl
        ;;
    2)
        install_kubectl
        install_minikube
        ;;
    3)
        install_containerd
        install_kubectl
        install_kubeadm
        ;;
    4)
        install_containerd
        install_kubectl
        install_kubeadm
        install_helm
        ;;
    5)
        install_containerd
        install_kubectl
        install_kubeadm
        install_minikube
        install_helm
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

# Verify installations
echo ""
echo "Verifying Kubernetes installations..."
kubectl version --client

if command -v minikube &> /dev/null; then
    echo "Minikube version: $(minikube version)"
fi

if command -v kubeadm &> /dev/null; then
    echo "kubeadm version: $(kubeadm version --short)"
fi

if command -v helm &> /dev/null; then
    echo "Helm version: $(helm version --short)"
fi

echo ""
echo "=================================================="
echo "Kubernetes installation completed successfully!"
echo "=================================================="
