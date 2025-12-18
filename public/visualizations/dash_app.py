#!/usr/bin/env python3
"""
Plotly Dash Dashboard for Nova Corrente Telecom Demand Forecasting
Interactive visualization system with time-series, external factors, and forecasting displays
"""

import sys
from pathlib import Path
import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional

# Add project root to path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

try:
    import dash
    from dash import dcc, html, Input, Output, callback_context
    import plotly.express as px
    import plotly.graph_objects as go
    from plotly.subplots import make_subplots
    HAS_DASH = True
except ImportError:
    HAS_DASH = False
    print("⚠️  Dash/Plotly not installed. Install with: pip install dash plotly")

import warnings
warnings.filterwarnings('ignore')


class NovaCorrenteDashboard:
    """Interactive dashboard for telecom demand forecasting"""
    
    def __init__(self, data_dir: Path = None):
        """
        Initialize dashboard with training data
        
        Args:
            data_dir: Path to training data directory
        """
        if not HAS_DASH:
            raise ImportError(
                "Dash/Plotly required. Install with:\n"
                "pip install dash plotly dash-bootstrap-components"
            )
        
        if data_dir is None:
            data_dir = project_root / "data" / "training"
        self.data_dir = data_dir
        
        # Load training metadata
        metadata_path = self.data_dir / "metadata.json"
        if metadata_path.exists():
            with open(metadata_path, 'r') as f:
                self.metadata = json.load(f)
        else:
            self.metadata = {"total_items": 0, "items": []}
        
        # Load training summary
        summary_path = self.data_dir / "training_summary.json"
        if summary_path.exists():
            with open(summary_path, 'r') as f:
                self.summary = json.load(f)
        else:
            self.summary = {}
        
        # Load data for all items
        self.data = {}
        for item_id in self.metadata.get("items", []):
            data_path = self.data_dir / f"{item_id}_full.csv"
            if data_path.exists():
                try:
                    df = pd.read_csv(data_path)
                    if 'date' in df.columns:
                        df['date'] = pd.to_datetime(df['date'])
                    self.data[item_id] = df
                    print(f"✓ Loaded {item_id}: {len(df)} records")
                except Exception as e:
                    print(f"⚠️  Could not load {item_id}: {e}")
        
        # Load Brazilian datasets if available
        self._load_brazilian_datasets()
    
    def _load_brazilian_datasets(self):
        """Load Brazilian telecom datasets for network quality visualization"""
        brazilian_data_dir = project_root / "data" / "raw"
        
        # Load Zenodo Broadband Brazil dataset
        broadband_path = brazilian_data_dir / "zenodo_broadband_brazil" / "BROADBAND_USER_INFO.csv"
        if broadband_path.exists():
            try:
                df = pd.read_csv(broadband_path)
                # Clean column names
                df.columns = [col.strip() for col in df.columns]
                # Convert Packet_Loss to numeric
                if 'Packet_Loss' in df.columns:
                    df['Packet_Loss'] = df['Packet_Loss'].str.rstrip('%').astype(float)
                self.data['BRAZIL_BROADBAND'] = df
                print(f"✓ Loaded BRAZIL_BROADBAND: {len(df)} records")
            except Exception as e:
                print(f"⚠️  Could not load Brazilian broadband data: {e}")
        
        # Initialize Dash app
        self.app = dash.Dash(
            __name__,
            external_stylesheets=[
                'https://codepen.io/chriddyp/pen/bWLwgP.css',
                'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
            ]
        )
        
        # Set app title
        self.app.title = "Nova Corrente - Telecom Demand Forecasting"
        
        # Build layout
        self.app.layout = self._create_layout()
        
        # Register callbacks
        self._register_callbacks()
    
    def _create_layout(self) -> html.Div:
        """Create dashboard layout"""
        return html.Div([
            # Header
            html.Div([
                html.H1(
                    "🇧🇷 Nova Corrente Telecom Demand Forecasting",
                    style={
                        'textAlign': 'center',
                        'color': '#003366',
                        'fontFamily': 'Inter, sans-serif',
                        'fontWeight': '700',
                        'marginBottom': '10px',
                        'fontSize': '32px'
                    }
                ),
                html.P(
                    "Sistema de Previsibilidade de Demanda - Grand Prix SENAI",
                    style={
                        'textAlign': 'center',
                        'color': '#666',
                        'fontFamily': 'Inter, sans-serif',
                        'fontSize': '16px',
                        'marginBottom': '30px'
                    }
                )
            ], style={'padding': '20px', 'backgroundColor': '#f8f9fa', 'borderRadius': '10px', 'margin': '20px'}),
            
            # Controls
            html.Div([
                html.Div([
                    html.Label("Item ID:", style={'fontWeight': 'bold', 'marginRight': '10px'}),
                    dcc.Dropdown(
                        id='item-dropdown',
                        options=[
                            {'label': item_id, 'value': item_id}
                            for item_id in self.metadata.get("items", [])
                        ],
                        value=self.metadata.get("items", [None])[0] if self.metadata.get("items") else None,
                        style={'width': '200px'}
                    )
                ], style={'display': 'inline-block', 'marginRight': '30px'}),
                
                html.Div([
                    html.Label("Visualização:", style={'fontWeight': 'bold', 'marginRight': '10px'}),
                    dcc.Dropdown(
                        id='chart-type',
                        options=[
                            {'label': 'Série Temporal', 'value': 'timeseries'},
                            {'label': 'Distribuição', 'value': 'distribution'},
                            {'label': 'Fatores Externos', 'value': 'external'},
                            {'label': 'Análise de Padrões', 'value': 'patterns'},
                            {'label': 'Previsão (Simulada)', 'value': 'forecast'}
                        ],
                        value='timeseries',
                        style={'width': '200px'}
                    )
                ], style={'display': 'inline-block', 'marginRight': '30px'}),
                
                html.Div([
                    dcc.Checklist(
                        id='external-factors',
                        options=[
                            {'label': 'Temperatura', 'value': 'temperature'},
                            {'label': 'Precipitação', 'value': 'precipitation'},
                            {'label': 'Câmbio', 'value': 'exchange'},
                            {'label': 'Feriados', 'value': 'holidays'}
                        ],
                        value=['temperature'],
                        style={'display': 'inline-block'}
                    )
                ], style={'display': 'inline-block'})
            ], style={
                'padding': '20px',
                'backgroundColor': 'white',
                'borderRadius': '10px',
                'margin': '20px',
                'boxShadow': '0 2px 4px rgba(0,0,0,0.1)'
            }),
            
            # Key Metrics
            html.Div(id='metrics-display', style={'margin': '20px'}),
            
            # Main Chart
            html.Div([
                dcc.Graph(id='main-chart', style={'height': '500px'})
            ], style={
                'padding': '20px',
                'backgroundColor': 'white',
                'borderRadius': '10px',
                'margin': '20px',
                'boxShadow': '0 2px 4px rgba(0,0,0,0.1)'
            }),
            
            # Secondary Charts
            html.Div([
                html.Div([
                    dcc.Graph(id='secondary-chart-1', style={'height': '400px'})
                ], style={'width': '48%', 'display': 'inline-block', 'padding': '10px'}),
                html.Div([
                    dcc.Graph(id='secondary-chart-2', style={'height': '400px'})
                ], style={'width': '48%', 'display': 'inline-block', 'padding': '10px'})
            ], style={
                'backgroundColor': 'white',
                'borderRadius': '10px',
                'margin': '20px',
                'boxShadow': '0 2px 4px rgba(0,0,0,0.1)'
            }),
            
            # Footer
            html.Div([
                html.P(
                    "Dados de telecomunicações brasileiras • Sistema de Previsão de Demanda",
                    style={'textAlign': 'center', 'color': '#999', 'fontSize': '12px'}
                )
            ], style={'marginTop': '40px', 'padding': '20px'})
        ], style={'backgroundColor': '#f0f2f5', 'minHeight': '100vh'})
    
    def _register_callbacks(self):
        """Register Dash callbacks"""
        
        @self.app.callback(
            [Output('main-chart', 'figure'),
             Output('secondary-chart-1', 'figure'),
             Output('secondary-chart-2', 'figure'),
             Output('metrics-display', 'children')],
            [Input('item-dropdown', 'value'),
             Input('chart-type', 'value'),
             Input('external-factors', 'value')]
        )
        def update_charts(item_id, chart_type, external_factors):
            """Update charts based on user selections"""
            if not item_id or item_id not in self.data:
                empty_fig = go.Figure()
                empty_fig.add_annotation(
                    text="Selecione um Item ID válido",
                    xref="paper", yref="paper",
                    x=0.5, y=0.5, showarrow=False
                )
                return empty_fig, empty_fig, empty_fig, html.Div()
            
            df = self.data[item_id]
            
            # Generate main chart
            main_fig = self._generate_main_chart(df, item_id, chart_type, external_factors)
            
            # Generate secondary charts
            sec_fig_1 = self._generate_secondary_chart_1(df, item_id, chart_type)
            sec_fig_2 = self._generate_secondary_chart_2(df, item_id, chart_type)
            
            # Generate metrics
            metrics = self._generate_metrics(df, item_id)
            
            return main_fig, sec_fig_1, sec_fig_2, metrics
    
    def _generate_main_chart(self, df: pd.DataFrame, item_id: str, 
                            chart_type: str, external_factors: List[str]) -> go.Figure:
        """Generate main chart based on chart type"""
        
        # Check if this is Brazilian broadband data (different structure)
        if item_id == 'BRAZIL_BROADBAND':
            fig = self._create_network_quality_chart(df)
        elif chart_type == 'timeseries':
            fig = self._create_timeseries_chart(df, external_factors)
        elif chart_type == 'distribution':
            fig = self._create_distribution_chart(df)
        elif chart_type == 'external':
            fig = self._create_external_factors_chart(df, external_factors)
        elif chart_type == 'patterns':
            fig = self._create_patterns_chart(df)
        elif chart_type == 'forecast':
            fig = self._create_forecast_chart(df)
        else:
            fig = self._create_timeseries_chart(df, external_factors)
        
        fig.update_layout(
            template='plotly_white',
            font=dict(family='Inter, sans-serif', size=12),
            height=500,
            margin=dict(l=50, r=50, t=30, b=50)
        )
        
        return fig
    
    def _create_network_quality_chart(self, df: pd.DataFrame) -> go.Figure:
        """Create network quality visualization for Brazilian broadband data"""
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=('Latência (ms)', 'Jitter (ms)', 'Perda de Pacotes (%)', 'Qualidade dos Canais'),
            vertical_spacing=0.12,
            horizontal_spacing=0.1
        )
        
        # Latency distribution
        fig.add_trace(
            go.Histogram(
                x=df['Latency'],
                nbinsx=50,
                name='Latência',
                marker_color='#003366',
                opacity=0.7
            ),
            row=1, col=1
        )
        
        # Jitter distribution
        fig.add_trace(
            go.Histogram(
                x=df['Jitter'],
                nbinsx=50,
                name='Jitter',
                marker_color='#ff6b6b',
                opacity=0.7
            ),
            row=1, col=2
        )
        
        # Packet loss
        fig.add_trace(
            go.Histogram(
                x=df['Packet_Loss'],
                nbinsx=50,
                name='Perda de Pacotes',
                marker_color='#f7b731',
                opacity=0.7
            ),
            row=2, col=1
        )
        
        # Channel quality comparison
        channel2_quality = df.groupby('Channel2_quality').size()
        channel5_quality = df.groupby('Channel5_quality').size()
        
        fig.add_trace(
            go.Bar(
                x=channel2_quality.index,
                y=channel2_quality.values,
                name='Canal 2',
                marker_color='#4ecdc4',
                opacity=0.7
            ),
            row=2, col=2
        )
        
        fig.add_trace(
            go.Bar(
                x=channel5_quality.index,
                y=channel5_quality.values,
                name='Canal 5',
                marker_color='#9b59b6',
                opacity=0.7
            ),
            row=2, col=2
        )
        
        fig.update_xaxes(title_text="Latência (ms)", row=1, col=1)
        fig.update_xaxes(title_text="Jitter (ms)", row=1, col=2)
        fig.update_xaxes(title_text="Perda de Pacotes (%)", row=2, col=1)
        fig.update_xaxes(title_text="Qualidade", row=2, col=2)
        
        fig.update_yaxes(title_text="Frequência", row=1, col=1)
        fig.update_yaxes(title_text="Frequência", row=1, col=2)
        fig.update_yaxes(title_text="Frequência", row=2, col=1)
        fig.update_yaxes(title_text="Frequência", row=2, col=2)
        
        fig.update_layout(
            title="Análise de Qualidade de Rede - Dados Brasileiros",
            showlegend=True,
            height=600
        )
        
        return fig
    
    def _create_timeseries_chart(self, df: pd.DataFrame, external_factors: List[str]) -> go.Figure:
        """Create time-series chart with optional external factors"""
        
        # Determine if we need subplots
        has_external = any(factor in external_factors for factor in 
                          ['temperature', 'precipitation', 'exchange', 'holidays'])
        
        if has_external:
            fig = make_subplots(
                rows=2, cols=1,
                shared_xaxes=True,
                vertical_spacing=0.1,
                row_heights=[0.7, 0.3]
            )
            
            # Main demand chart
            fig.add_trace(
                go.Scatter(
                    x=df['date'],
                    y=df['quantity'],
                    mode='lines',
                    name='Demanda',
                    line=dict(color='#003366', width=2)
                ),
                row=1, col=1
            )
            
            # External factors chart
            row = 2
            for factor in external_factors:
                if factor == 'temperature' and 'temperature' in df.columns:
                    fig.add_trace(
                        go.Scatter(
                            x=df['date'],
                            y=df['temperature'],
                            mode='lines',
                            name='Temperatura (°C)',
                            line=dict(color='#ff6b6b', width=1.5)
                        ),
                        row=row, col=1
                    )
                elif factor == 'precipitation' and 'precipitation' in df.columns:
                    fig.add_trace(
                        go.Bar(
                            x=df['date'],
                            y=df['precipitation'],
                            name='Precipitação (mm)',
                            marker_color='#4ecdc4'
                        ),
                        row=row, col=1
                    )
                elif factor == 'exchange' and 'exchange_rate_brl_usd' in df.columns:
                    fig.add_trace(
                        go.Scatter(
                            x=df['date'],
                            y=df['exchange_rate_brl_usd'],
                            mode='lines',
                            name='Câmbio (BRL/USD)',
                            line=dict(color='#f7b731', width=1.5)
                        ),
                        row=row, col=1
                    )
                elif factor == 'holidays' and 'is_holiday' in df.columns:
                    holidays = df[df['is_holiday'] == 1]
                    if len(holidays) > 0:
                        fig.add_trace(
                            go.Scatter(
                                x=holidays['date'],
                                y=[max(df['quantity'])] * len(holidays),
                                mode='markers',
                                name='Feriados',
                                marker=dict(symbol='diamond', size=10, color='red')
                            ),
                            row=1, col=1
                        )
            
            fig.update_xaxes(title_text="Data", row=2, col=1)
            fig.update_yaxes(title_text="Demanda", row=1, col=1)
            fig.update_yaxes(title_text="Fatores Externos", row=2, col=1)
            
        else:
            # Simple single chart
            fig = go.Figure()
            fig.add_trace(
                go.Scatter(
                    x=df['date'],
                    y=df['quantity'],
                    mode='lines+markers',
                    name='Demanda',
                    line=dict(color='#003366', width=2),
                    marker=dict(size=3)
                )
            )
            fig.update_xaxes(title_text="Data")
            fig.update_yaxes(title_text="Quantidade")
        
        fig.update_layout(
            title="Evolução Temporal da Demanda",
            showlegend=True
        )
        
        return fig
    
    def _create_distribution_chart(self, df: pd.DataFrame) -> go.Figure:
        """Create distribution analysis chart"""
        fig = go.Figure()
        
        # Histogram
        fig.add_trace(
            go.Histogram(
                x=df['quantity'],
                nbinsx=50,
                name='Distribuição',
                marker_color='#003366',
                opacity=0.7
            )
        )
        
        # Add statistics lines
        mean_val = df['quantity'].mean()
        std_val = df['quantity'].std()
        
        fig.add_vline(
            x=mean_val,
            line_dash="dash",
            line_color="red",
            annotation_text=f"Média: {mean_val:.2f}"
        )
        
        fig.update_layout(
            title="Distribuição de Frequência da Demanda",
            xaxis_title="Quantidade",
            yaxis_title="Frequência"
        )
        
        return fig
    
    def _create_external_factors_chart(self, df: pd.DataFrame, factors: List[str]) -> go.Figure:
        """Create external factors correlation chart"""
        
        # Check available external factors
        available_factors = {
            'temperature': 'temperature',
            'precipitation': 'precipitation',
            'humidity': 'humidity',
            'exchange': 'exchange_rate_brl_usd',
            'inflation': 'inflation_rate'
        }
        
        fig = go.Figure()
        
        for factor in factors:
            col_name = available_factors.get(factor)
            if col_name and col_name in df.columns:
                fig.add_trace(
                    go.Scatter(
                        x=df['date'],
                        y=df[col_name],
                        mode='lines',
                        name=factor.replace('_', ' ').title(),
                        line=dict(width=1.5)
                    )
                )
        
        fig.update_layout(
            title="Fatores Externos ao Longo do Tempo",
            xaxis_title="Data",
            yaxis_title="Valor",
            showlegend=True
        )
        
        return fig
    
    def _create_patterns_chart(self, df: pd.DataFrame) -> go.Figure:
        """Create pattern analysis chart (daily, weekly, monthly)"""
        df = df.copy()
        df['day_of_week'] = df['date'].dt.day_name()
        df['month'] = df['date'].dt.strftime('%b')
        df['hour'] = df['date'].dt.hour
        
        fig = make_subplots(
            rows=1, cols=3,
            subplot_titles=('Padrão Semanal', 'Padrão Mensal', 'Padrão Horário'),
            shared_yaxes=True
        )
        
        # Weekly pattern
        weekly_avg = df.groupby('day_of_week')['quantity'].mean()
        weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        weekly_avg = weekly_avg.reindex([d for d in weekdays if d in weekly_avg.index])
        
        fig.add_trace(
            go.Bar(
                x=weekly_avg.index,
                y=weekly_avg.values,
                name='Média Semanal',
                marker_color='#003366'
            ),
            row=1, col=1
        )
        
        # Monthly pattern
        monthly_avg = df.groupby('month')['quantity'].mean()
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        monthly_avg = monthly_avg.reindex([m for m in months if m in monthly_avg.index])
        
        fig.add_trace(
            go.Bar(
                x=monthly_avg.index,
                y=monthly_avg.values,
                name='Média Mensal',
                marker_color='#ff6b6b'
            ),
            row=1, col=2
        )
        
        # Hourly pattern (if exists)
        if 'hour' in df.columns:
            hourly_avg = df.groupby('hour')['quantity'].mean()
            fig.add_trace(
                go.Scatter(
                    x=hourly_avg.index,
                    y=hourly_avg.values,
                    mode='lines+markers',
                    name='Média Horária',
                    line=dict(color='#4ecdc4', width=2)
                ),
                row=1, col=3
            )
        
        fig.update_layout(
            title="Análise de Padrões de Demanda",
            showlegend=False,
            height=400
        )
        
        return fig
    
    def _create_forecast_chart(self, df: pd.DataFrame) -> go.Figure:
        """Create simulated forecast chart"""
        # Simple linear trend forecast
        from sklearn.linear_model import LinearRegression
        
        df = df.sort_values('date')
        X = np.arange(len(df)).reshape(-1, 1)
        y = df['quantity'].values
        
        model = LinearRegression()
        model.fit(X, y)
        
        # Historical
        historical_dates = df['date']
        historical_y = df['quantity']
        
        # Forecast (next 30 days)
        last_date = df['date'].max()
        forecast_dates = pd.date_range(
            start=last_date + timedelta(days=1),
            periods=30,
            freq='D'
        )
        
        X_forecast = np.arange(len(df), len(df) + 30).reshape(-1, 1)
        y_forecast = model.predict(X_forecast)
        
        # Create confidence bands (±10%)
        y_upper = y_forecast * 1.1
        y_lower = y_forecast * 0.9
        
        fig = go.Figure()
        
        # Historical
        fig.add_trace(
            go.Scatter(
                x=historical_dates,
                y=historical_y,
                mode='lines',
                name='Histórico',
                line=dict(color='#003366', width=2)
            )
        )
        
        # Forecast
        fig.add_trace(
            go.Scatter(
                x=forecast_dates,
                y=y_forecast,
                mode='lines',
                name='Previsão',
                line=dict(color='#4ecdc4', width=2, dash='dash')
            )
        )
        
        # Confidence bands
        fig.add_trace(
            go.Scatter(
                x=list(forecast_dates) + list(reversed(forecast_dates)),
                y=list(y_upper) + list(reversed(y_lower)),
                fill='toself',
                fillcolor='rgba(78, 205, 196, 0.2)',
                line=dict(color='rgba(255,255,255,0)'),
                name='Intervalo de Confiança (90%)',
                showlegend=True
            )
        )
        
        fig.update_layout(
            title="Previsão de Demanda (30 dias) - Modelo Linear",
            xaxis_title="Data",
            yaxis_title="Quantidade",
            showlegend=True
        )
        
        return fig
    
    def _generate_secondary_chart_1(self, df: pd.DataFrame, item_id: str, chart_type: str) -> go.Figure:
        """Generate first secondary chart"""
        if chart_type == 'timeseries':
            # Box plot by month
            df['month'] = df['date'].dt.to_period('M').astype(str)
            fig = px.box(df, x='month', y='quantity', title="Distribuição Mensal")
        else:
            # Correlation heatmap if external factors available
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) > 1:
                corr = df[numeric_cols].corr()
                fig = px.imshow(
                    corr,
                    title="Matriz de Correlação",
                    color_continuous_scale='RdBu',
                    aspect="auto"
                )
            else:
                fig = go.Figure()
                fig.add_annotation(text="Dados insuficientes", showarrow=False)
        
        fig.update_layout(template='plotly_white', height=400)
        return fig
    
    def _generate_secondary_chart_2(self, df: pd.DataFrame, item_id: str, chart_type: str) -> go.Figure:
        """Generate second secondary chart"""
        if chart_type == 'timeseries':
            # Trend analysis
            df = df.sort_values('date')
            df['moving_avg'] = df['quantity'].rolling(window=30).mean()
            
            fig = go.Figure()
            fig.add_trace(
                go.Scatter(
                    x=df['date'],
                    y=df['quantity'],
                    mode='lines',
                    name='Demanda',
                    opacity=0.3,
                    line=dict(color='gray')
                )
            )
            fig.add_trace(
                go.Scatter(
                    x=df['date'],
                    y=df['moving_avg'],
                    mode='lines',
                    name='Média Móvel (30 dias)',
                    line=dict(color='#ff6b6b', width=2)
                )
            )
            fig.update_layout(title="Tendência - Média Móvel")
        else:
            # Statistics summary
            stats_text = f"""
            <b>Estatísticas do Item: {item_id}</b><br>
            Total de Registros: {len(df)}<br>
            Média: {df['quantity'].mean():.2f}<br>
            Mediana: {df['quantity'].median():.2f}<br>
            Desvio Padrão: {df['quantity'].std():.2f}<br>
            Mínimo: {df['quantity'].min():.2f}<br>
            Máximo: {df['quantity'].max():.2f}
            """
            fig = go.Figure()
            fig.add_annotation(
                text=stats_text,
                xref="paper", yref="paper",
                x=0.5, y=0.5,
                showarrow=False,
                font=dict(size=14),
                align='left'
            )
            fig.update_layout(title="Resumo Estatístico")
        
        fig.update_layout(template='plotly_white', height=400)
        return fig
    
    def _generate_metrics(self, df: pd.DataFrame, item_id: str) -> html.Div:
        """Generate key metrics display"""
        stats = self.summary.get('items_statistics', {}).get(item_id, {})
        quantity_stats = stats.get('quantity', {})
        
        metrics_html = [
            html.Div([
                html.Div([
                    html.H3(f"{quantity_stats.get('mean', 0):.2f}", style={'margin': '0', 'color': '#003366'}),
                    html.P("Média de Demanda", style={'margin': '0', 'fontSize': '14px'})
                ], style={'textAlign': 'center', 'padding': '20px', 'backgroundColor': 'white', 
                         'borderRadius': '8px', 'boxShadow': '0 2px 4px rgba(0,0,0,0.1)'}),
                html.Div([
                    html.H3(f"{quantity_stats.get('std', 0):.2f}", style={'margin': '0', 'color': '#ff6b6b'}),
                    html.P("Desvio Padrão", style={'margin': '0', 'fontSize': '14px'})
                ], style={'textAlign': 'center', 'padding': '20px', 'backgroundColor': 'white', 
                         'borderRadius': '8px', 'boxShadow': '0 2px 4px rgba(0,0,0,0.1)'}),
                html.Div([
                    html.H3(f"{stats.get('records', 0):,}", style={'margin': '0', 'color': '#4ecdc4'}),
                    html.P("Registros Históricos", style={'margin': '0', 'fontSize': '14px'})
                ], style={'textAlign': 'center', 'padding': '20px', 'backgroundColor': 'white', 
                         'borderRadius': '8px', 'boxShadow': '0 2px 4px rgba(0,0,0,0.1)'}),
                html.Div([
                    html.H3(f"{stats.get('date_range', {}).get('start', 'N/A')}", 
                           style={'margin': '0', 'color': '#f7b731', 'fontSize': '20px'}),
                    html.P("Início", style={'margin': '0', 'fontSize': '14px'})
                ], style={'textAlign': 'center', 'padding': '20px', 'backgroundColor': 'white', 
                         'borderRadius': '8px', 'boxShadow': '0 2px 4px rgba(0,0,0,0.1)'}),
            ], style={'display': 'flex', 'justifyContent': 'space-around', 'flexWrap': 'wrap', 'gap': '20px'})
        ]
        
        return html.Div(metrics_html)
    
    def run(self, host='127.0.0.1', port=8050, debug=True):
        """Run the dashboard"""
        if not self.data:
            print("⚠️  No data loaded. Cannot run dashboard.")
            return
        
        print(f"\n{'='*70}")
        print("🚀 NOVA CORRENTE TELECOM DASHBOARD")
        print(f"{'='*70}")
        print(f"📊 Dashboard running on: http://{host}:{port}")
        print(f"📁 Loaded {len(self.data)} items:")
        for item_id in self.data:
            print(f"   ✓ {item_id}: {len(self.data[item_id])} records")
        print(f"{'='*70}\n")
        
        self.app.run(host=host, port=port, debug=debug)


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Nova Corrente Telecom Demand Forecasting Dashboard"
    )
    parser.add_argument(
        '--port',
        type=int,
        default=8050,
        help='Port to run dashboard (default: 8050)'
    )
    parser.add_argument(
        '--host',
        type=str,
        default='127.0.0.1',
        help='Host to run dashboard (default: 127.0.0.1)'
    )
    parser.add_argument(
        '--no-debug',
        action='store_true',
        help='Disable debug mode'
    )
    
    args = parser.parse_args()
    
    try:
        dashboard = NovaCorrenteDashboard()
        dashboard.run(host=args.host, port=args.port, debug=not args.no_debug)
    except KeyboardInterrupt:
        print("\n\n✓ Dashboard stopped by user")
    except Exception as e:
        print(f"\n❌ Error running dashboard: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()

