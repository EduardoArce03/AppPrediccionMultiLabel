import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Product } from '../../api/product';
import { ProductService } from '../../service/product.service';
import { Subscription, debounceTime } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { PredictionService } from '../../service/prediction.service';
import { AuthService } from '../../service/auth.service';

@Component({
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {

    items!: MenuItem[];
    recentPredictions: any[] = [];
    allPredictions: any[] = [];
    products!: Product[];
    chartData: any;
    userId: any;
    chartOptions: any;
    subscription!: Subscription;
    selectedProduct: any;
    displayModal: boolean = false;
    insufficientData: boolean = false;
    selectedPrediction: any = null; // Almacena la predicción seleccionada
    user: any = null;

    constructor(private productService: ProductService, public layoutService: LayoutService,
        private predictionService: PredictionService, private authService: AuthService) {
        this.authService.isAuthenticated$.subscribe((status) => {
            this.user = this.authService.getUser();
        });
        this.subscription = this.layoutService.configUpdate$
            .pipe(debounceTime(25))
            .subscribe((config) => {
                this.initChart();
            });
    }

    ngOnInit() {
        this.initChart();
        this.loadRecentPredictions();
        this.getAllPredictions();
        this.productService.getProductsSmall().then(data => this.products = data);
        this.loadCategoryData();

        this.items = [
            { label: 'Add New', icon: 'pi pi-fw pi-plus' },
            { label: 'Remove', icon: 'pi pi-fw pi-minus' }
        ];
        console.log('Usuario', localStorage.getItem('user'));
    }

    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.chartData = {
            labels: [],
            datasets: [
                {
                    data: [],
                    backgroundColor: []
                }
            ]
        };

        this.chartOptions = {

        };
    }

    loadCategoryData() {
        const userId = localStorage.getItem('user_id') || '1';
        this.predictionService.getPredictionsGrafico(userId).subscribe(
            (data) => {
                const predictions = data.predictions;

                console.log("predicciones "+predictions)

                const categoryCounts: { [key: string]: number } = {};
                let total = 0;

                // Procesar las predicciones como listas
                predictions.forEach(prediction => {
                    prediction.predictions.forEach((category: string) => {
                        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
                        total++;
                    });
                });


                const labels = Object.keys(categoryCounts);
                const values = Object.values(categoryCounts).map(count => (count / total) * 100);

                
                console.log("datos" + labels);

                // Manejar el caso de no tener datos
                if (labels.length === 0) {
                    this.chartData = {
                        labels: ['Sin datos'],
                        datasets: [{
                            data: [100], // Representar todo como "Sin datos"
                            backgroundColor: ['#d3d3d3'] // Color gris para "Sin datos"
                        }]
                    };
                } else {
                    this.chartData = {
                        labels: labels,
                        datasets: [{
                            data: values,
                            backgroundColor: ['#36A2EB', '#FF6384', '#4BC0C0', '#FF9F40']
                        }]
                    };
                }

                // Opciones del gráfico
                this.chartOptions = {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                };
            },
            (error) => {
                console.error('Error fetching predictions:', error);
                this.insufficientData = true;
            }
        );
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    loadRecentPredictions() {
        this.userId = localStorage.getItem('user');
        if (this.userId) {
            const parsedUser = JSON.parse(this.userId); // Convertir de JSON a objeto
            const userId = parsedUser.id; // Extraer el campo `id`
            this.predictionService.getRecentPredictions(userId).subscribe(
                (data) => {
                    this.recentPredictions = data.predictions;
                },
                (error) => {
                    console.error('Error fetching recent predictions:', error);
                }
            );
        }
    }

    viewPrediction(product: any): void {
        this.selectedProduct = product;
        this.displayModal = true;
    }

    getAllPredictions() {
        this.predictionService.getAllPredictions().subscribe(
            (data) => {
                this.allPredictions = data.predictions;
            },
            (error) => {
                console.error('Error al obtener todas las predicciones:', error);
            }
        );
    }

    showDetails(prediction: any): void {
        this.selectedPrediction = prediction; // Asigna la predicción seleccionada
        this.displayModal = true; // Abre el diálogo
    }

}
