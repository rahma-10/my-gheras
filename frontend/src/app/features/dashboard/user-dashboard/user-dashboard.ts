import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css',
})
export class UserDashboard implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  // User info
  userName = computed(() => {
    const user = this.authService.currentUser();
    return user?.firstName || user?.username || user?.name || 'بك';
  });

  // Add Plant Modal
  showAddPlantModal = false;
  plants = signal<any[]>([]);
  plantsLoading = false;
  selectedPlantId = '';
  plantNickname = '';

  ngOnInit() {
    this.loadPlants();
  }

  loadPlants() {
    this.plantsLoading = true;
    this.http.get<any[]>('http://localhost:3000/api/plants').subscribe({
      next: (data) => {
        this.plants.set(data);
        this.plantsLoading = false;
      },
      error: (err) => {
        console.error('Error loading plants:', err);
        this.plantsLoading = false;
      }
    });
  }

  openAddPlant() {
    this.showAddPlantModal = true;
    this.selectedPlantId = '';
    this.plantNickname = '';
  }

  closeAddPlant() {
    this.showAddPlantModal = false;
  }

  addPlant() {
    if (!this.selectedPlantId) return;
    // TODO: POST to API to add plant to user
    console.log('Adding plant:', this.selectedPlantId, this.plantNickname);
    this.closeAddPlant();
  }
}
