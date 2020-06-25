provider "google" {
  credentials = "${file("/installer/gcp_install/credentials.json")}"
  project     = "${var.project_name}"
  zone        = "${var.zone}"
}


resource "google_compute_instance" "vm_instance" {
  name         = "carrier"
  machine_type = "vmtype"

  boot_disk {
    initialize_params {
      image = "ostype"
    }
  }

  network_interface {
  network = "default"

  access_config {}
  }

  metadata = {
    ssh-keys = "${var.account_name}:${file("/installer/gcp_install/id_rsa.pub")}"
  }
}

resource "google_compute_firewall" "default" {
 name    = "carrier-firewall"
 network = "default"

 allow {
   protocol = "tcp"
   ports    = ["80", "443", "8080", "8086", "3100", "4444", "9999"]
 }
}
