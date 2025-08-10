#!/bin/bash
echo "🚀 Cleaning up unused containers, pods, and images in k3s..."

# Xóa tất cả container đã dừng
sudo k3s crictl ps -a
sudo k3s crictl rm -f $(sudo k3s crictl ps -a -q) 2>/dev/null || true

# Xóa tất cả pod đã dừng
sudo k3s crictl pods
sudo k3s crictl rmp -f $(sudo k3s crictl pods -q) 2>/dev/null || true

# Xóa image không dùng
sudo k3s crictl images
sudo k3s crictl rmi --prune 2>/dev/null || true

# Dọn log hệ thống
sudo journalctl --vacuum-time=3d
sudo rm -rf /var/log/*.gz /var/log/*-???????? /var/log/journal/*/*

echo "✅ Cleanup done."
df -h
