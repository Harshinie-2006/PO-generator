# Monitoring Stack Setup Guide

This guide provides step-by-step instructions for manually installing and configuring **Prometheus**, **Grafana**, and **Node Exporter** on an Ubuntu server to monitor the PO Generator infrastructure.

---

## 🚀 1. Install Dependencies

First, update your system and install necessary packages.

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install common utilities
sudo apt install -y curl wget software-properties-common
```

---

## 📊 2. Install Prometheus

Prometheus is the core monitoring system that collects metrics via a pull model.

### Installation
```bash
# Update repositories and install Prometheus
sudo apt update
sudo apt install -y prometheus

# Enable and start the service
sudo systemctl enable prometheus
sudo systemctl start prometheus

# Verify status
sudo systemctl status prometheus
```

### Accessing Prometheus
- **URL:** [http://localhost:9090](http://localhost:9090)
- **Default Port:** `9090`

---

## 📈 3. Install Grafana

Grafana is the visualization platform used to create dashboards from Prometheus data.

### Installation
```bash
# Add Grafana GPG key
sudo mkdir -p /etc/apt/keyrings/
wget -q -O - https://apt.grafana.com/gpg.key | gpg --dearmor | sudo tee /etc/apt/keyrings/grafana.gpg > /dev/null

# Add Grafana repository
echo "deb [signed-by=/etc/apt/keyrings/grafana.gpg] https://apt.grafana.com stable main" | sudo tee /etc/apt/sources.list.d/grafana.list

# Update and install Grafana
sudo apt update
sudo apt install -y grafana

# Start Grafana Server
sudo systemctl daemon-reload
sudo systemctl enable grafana-server
sudo systemctl start grafana-server
```

### Accessing Grafana
- **URL:** [http://localhost:3000](http://localhost:3000)
- **Credentials:**
  - **Username:** `admin`
  - **Password:** `admin` (You will be prompted to change this on first login)

---

## 🖥️ 4. Install Node Exporter

Node Exporter is installed on any server you wish to monitor (including the application servers).

### Installation
```bash
# Download latest Node Exporter (example version, check latest on GitHub)
VERSION="1.7.0"
wget https://github.com/prometheus/node_exporter/releases/download/v$VERSION/node_exporter-$VERSION.linux-amd64.tar.gz

# Extract and move binary
tar -xvf node_exporter-$VERSION.linux-amd64.tar.gz
sudo mv node_exporter-$VERSION.linux-amd64/node_exporter /usr/local/bin/

# Create a systemd service (Recommended over nohup)
sudo tee /etc/systemd/system/node_exporter.service <<EOF
[Unit]
Description=Node Exporter
Wants=network-online.target
After=network-online.target

[Service]
User=root
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=default.target
EOF

# Start Node Exporter
sudo systemctl daemon-reload
sudo systemctl enable node_exporter
sudo systemctl start node_exporter
```

### Verifying Metrics
- **Metrics URL:** [http://localhost:9100/metrics](http://localhost:9100/metrics)

---

## ⚙️ 5. Configure Prometheus Scraping

Bridge Prometheus and Node Exporter by editing the configuration file.

### Edit Configuration
```bash
sudo nano /etc/prometheus/prometheus.yml
```

### Add Scraping Jobs
Append the following under the `scrape_configs` section:

```yaml
scrape_configs:
  - job_name: 'node_exporter'
    static_configs:
      - targets: ['localhost:9100']

  # If monitoring the PO Generator Backend in the future:
  # - job_name: 'po-generator-backend'
  #   static_configs:
  #     - targets: ['localhost:5000']
```

### Restart Service
```bash
sudo systemctl restart prometheus
```

---

## 🛠️ 6. Set Up Grafana Dashboard

1. **Log in** to Grafana at `http://localhost:3000`.
2. **Add Data Source**:
   - Navigate to **Connections** → **Data Sources**.
   - Click **Add data source** and select **Prometheus**.
   - URL: `http://localhost:9090`
   - Click **Save & Test**.
3. **Import Dashboard**:
   - Go to **Dashboards** → **New** → **Import**.
   - Use Dashboard ID: `1860` (Node Exporter Full) or `11074` (Node Exporter for Prometheus).
   - Select the Prometheus data source and click **Import**.

---

> [!TIP]
> **Firewall Configuration**
> Ensure ports `9090`, `3000`, and `9100` are open if accessing from a remote machine:
> `sudo ufw allow 9090/tcp`
> `sudo ufw allow 3000/tcp`
> `sudo ufw allow 9100/tcp`
