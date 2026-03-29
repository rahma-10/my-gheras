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

  // Dashboard Data Signals
  myGarden = signal<any[]>([]);
  dashboardStats = signal<any>({ totalPlants: 0, alerts: 0 });
  notifications = signal<any[]>([]);
  dashboardLoading = signal(true);

  // Add Plant Modal State
  showAddPlantModal = false;
  
  // All plants fetched from DB
  allPlants = signal<any[]>([]);
  plantsLoading = false;

  // Categories (Families)
  categories = computed(() => {
    const plants = this.allPlants();
    const families = plants.map(p => p.family || 'غير مصنف');
    return [...new Set(families)]; // Unique list
  });

  // Selections
  selectedCategory = signal<string>('');
  selectedPlantId = signal<string>('');
  plantNickname = signal<string>('');

  // Plants filtered by selected category
  filteredPlants = computed(() => {
    const cat = this.selectedCategory();
    const plants = this.allPlants();
    if (!cat) return plants; // Return all plants if no family is selected
    return plants.filter(p => (p.family || 'غير مصنف') === cat);
  });

  // Plant Detail Side Drawer State
  showDetailsModal = signal(false);
  detailsLoading = signal(false);
  selectedPlantDetails = signal<any>(null);
  activeTab = signal<'plan' | 'disease' | 'history'>('plan');

  ngOnInit() {
    this.loadDashboardData();
    this.loadPlantsCatalog();
  }

  loadDashboardData() {
    this.dashboardLoading.set(true);
    // GET /api/dashboard returns { data: { myGarden, notifications, profile }, totalPlants, ... }
    this.http.get<any>('http://localhost:3000/api/dashboard').subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.myGarden.set(res.dashboardData?.myGarden || []);
          this.notifications.set(res.dashboardData?.notifications || []);
          this.dashboardStats.set({
             totalPlants: res.totalPlants || res.dashboardData?.myGarden?.length || 0,
             alerts: res.dashboardData?.notifications?.length || 0
          });
        }
        this.dashboardLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading dashboard:', err);
        this.dashboardLoading.set(false);
      }
    });
  }

  loadPlantsCatalog() {
    this.plantsLoading = true;
    this.http.get<any>('http://localhost:3000/api/plants?limit=100').subscribe({
      next: (res) => {
        // GET /api/plants returns list or { data: { plants: [...] } }
        const plantsArray = res.data?.plants || res;
        this.allPlants.set(Array.isArray(plantsArray) ? plantsArray : []);
        this.plantsLoading = false;
      },
      error: (err) => {
        console.error('Error loading plants catalog:', err);
        this.plantsLoading = false;
      }
    });
  }

  onCategoryChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedCategory.set(selectElement.value);
    this.selectedPlantId.set(''); // Reset selected plant when category changes
  }
  
  onPlantChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedPlantId.set(selectElement.value);
  }

  openAddPlant() {
    this.showAddPlantModal = true;
    this.selectedCategory.set('');
    this.selectedPlantId.set('');
    this.plantNickname.set('');
  }

  closeAddPlant() {
    this.showAddPlantModal = false;
  }

  addPlant() {
    if (!this.selectedPlantId()) return;

    this.http.post<any>('http://localhost:3000/api/dashboard/add-plant', {
      plantId: this.selectedPlantId(),
      nickname: this.plantNickname() // Pass nickname if backend supports it eventually
    }).subscribe({
      next: (res) => {
        console.log('Plant added successfully:', res);
        this.closeAddPlant();
        // Refresh dashboard data instantly
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Error adding plant:', err);
        const msg = err.error?.message || 'حدث خطأ أثناء إضافة النبتة. قد تكون وصلت للحد الأقصى أو النبتة موجودة بالفعل.';
        alert(msg);
      }
    });
  }

  // Plant Details Drawer Logic
  openPlantDetail(id: string) {
    this.showDetailsModal.set(true);
    this.detailsLoading.set(true);
    this.activeTab.set('plan');
    
    this.http.get<any>(`http://localhost:3000/api/dashboard/my-plant/${id}`).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.selectedPlantDetails.set(res.data.userPlant);
        }
        this.detailsLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading plant details:', err);
        this.detailsLoading.set(false);
      }
    });
  }

  closePlantDetail() {
    this.showDetailsModal.set(false);
    // Optional: reset data, but maybe leave it for smooth closing animation
    // this.selectedPlantDetails.set(null); 
  }

  // Calculate percentage of growth stage (Mock logic or use from DB)
  getGrowthProgress(addedAt: string): number {
      const start = new Date(addedAt).getTime();
      const now = new Date().getTime();
      const diffDays = Math.floor((now - start) / (1000 * 3600 * 24));
      // Assume 60 days standard harvest for visualization
      const percentage = Math.max(0, Math.min((diffDays / 60) * 100, 100));
      return Math.round(percentage);
  }

  // Calculate generic health status based on watering
  getHealthStatus(nextWatering: string): 'good' | 'warn' {
      if (!nextWatering) return 'good';
      const wateringDate = new Date(nextWatering).getTime();
      const now = new Date().getTime();
      return (wateringDate < now) ? 'warn' : 'good';
  }
  
  // Create an image URL
  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:3000/${imagePath}`;
  }
}
