import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Product } from '../../api/product';
import { ProductService } from '../../service/product.service';
import { Subscription, debounceTime } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { PredictionService } from '../../service/prediction.service';

@Component({
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {

    items!: MenuItem[];
    recentPredictions: any[] = [];
    products!: Product[];
    chartData: any;
    userId: any;
    chartOptions: any;
    subscription!: Subscription;
    selectedProduct: any;
    displayModal: boolean = false;
    insufficientData: boolean = false;

    constructor(private productService: ProductService, public layoutService: LayoutService, private predictionService: PredictionService) {
        this.subscription = this.layoutService.configUpdate$
            .pipe(debounceTime(25))
            .subscribe((config) => {
                this.initChart();
            });
    }

    ngOnInit() {
        this.initChart();
        this.loadRecentPredictions();
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
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [
                {
                    label: 'First Dataset',
                    data: [65, 59, 80, 81, 56, 55, 40],
                    fill: false,
                    backgroundColor: documentStyle.getPropertyValue('--bluegray-700'),
                    borderColor: documentStyle.getPropertyValue('--bluegray-700'),
                    tension: .4
                },
                {
                    label: 'Second Dataset',
                    data: [28, 48, 40, 19, 86, 27, 90],
                    fill: false,
                    backgroundColor: documentStyle.getPropertyValue('--green-600'),
                    borderColor: documentStyle.getPropertyValue('--green-600'),
                    tension: .4
                }
            ]
        };

        this.chartOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };
    }

    loadCategoryData() {
        const userId = localStorage.getItem('user_id') || '2'; // Replace with dynamic user ID

        this.predictionService.getRecentPredictions(userId).subscribe(
            (data) => {
                const predictions = data.predictions;

                if (predictions.length === 0) {
                    this.insufficientData = true;
                    return;
                }

                const categoryCounts: { [key: string]: number } = {};
                let total = 0;

                predictions.forEach(prediction => {
                    prediction.predictions.split(', ').forEach(category => {
                        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
                        total++;
                    });
                });

                const labels = Object.keys(categoryCounts);
                const values = Object.values(categoryCounts).map(count => (count / total) * 100);

                this.chartData = {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: ['#36A2EB', '#FF6384', '#4BC0C0', '#FF9F40']
                    }]
                };

                this.chartOptions = {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                };
                console.log('Predictions:', predictions);
                console.log('Chart Labels:', labels);
                console.log('Chart Values:', values);
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
}
