"""
Maximize Tower Coverage - Main Orchestrator Script
Fetches from all external sources, matches/merges data, identifies gaps,
and generates enhanced reports
"""

import logging
import pandas as pd
import json
import time
import os
from pathlib import Path
from datetime import datetime
from typing import Dict, Optional

# Import tower modules
import sys
sys.path.append(str(Path(__file__).parent.parent / "nova-corrente-workspace" / 
                   "feature-engineering" / "bifurcation-a-data-integration" / "features" / "towers"))

from enhanced_data_fetcher import EnhancedDataFetcher
from coverage_analyzer import CoverageAnalyzer
from location_enricher import LocationEnricher
from data_validator import DataValidator
from spatial_index import SpatialIndex

# Import extraction and reporting modules
sys.path.append(str(Path(__file__).parent))
from extract_tower_locations import TowerLocationExtractor
from generate_tower_location_report import TowerLocationReportGenerator
from integrate_research_assets import integrate_research_assets, ResearchAssetIntegrator
from advanced_features import apply_advanced_features, ExportManager
from monitoring_dashboard import SystemMonitor
from data_health_monitor import DataHealthMonitor
from data_export_manager import AdvancedExportManager
from visualization_enhanced import EnhancedVisualizer
from batch_processor import BatchProcessor, optimize_for_large_datasets
from data_quality_enhanced import EnhancedDataQuality
from data_backup_manager import BackupManager
from notification_system import NotificationSystem
from ml_predictive_analytics import PredictiveAnalytics
from advanced_caching import AdvancedCache
from cost_optimizer import CostOptimizer
from performance_profiler import PerformanceProfiler
from advanced_reporting import AdvancedReporter
from backend_integration import integrate_with_backend, BackendAPIClient
from tower_categorical_integration import TowerCategoricalIntegration
from tower_route_planning import TowerRoutePlanner
from tower_5g_integration import Tower5GIntegration
from hierarchical_features_integration import HierarchicalFeaturesIntegration
from frontend_integration_helper import FrontendIntegrationHelper

# Import utilities
sys.path.append(str(Path(__file__).parent))
from utils.timeout_handler import with_timeout, retry_with_backoff, timed_operation, safe_execute
from utils.progress_tracker import ProgressTracker

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"
OUTPUT_DIR = DATA_DIR / "outputs" / "tower_locations"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
CHECKPOINT_DIR = OUTPUT_DIR / "checkpoints"
CHECKPOINT_DIR.mkdir(parents=True, exist_ok=True)

# Timeout configurations (in seconds)
TIMEOUTS = {
    'load_towers': 300,  # 5 minutes
    'fetch_external': 600,  # 10 minutes
    'match_sources': 900,  # 15 minutes
    'identify_gaps': 1800,  # 30 minutes
    'enrich_locations': 1200,  # 20 minutes
    'validate_data': 600,  # 10 minutes
    'generate_reports': 1800,  # 30 minutes
}


@with_timeout(TIMEOUTS['load_towers'], default_return=pd.DataFrame(), operation_name="Load Nova Corrente Towers")
def load_nova_corrente_towers(progress_tracker: Optional[ProgressTracker] = None) -> pd.DataFrame:
    """Load existing Nova Corrente tower data"""
    with timed_operation("Loading Nova Corrente tower data"):
        # Check checkpoint first
        if progress_tracker:
            checkpoint_data = progress_tracker.load_checkpoint_data('load_towers')
            if checkpoint_data is not None and not checkpoint_data.empty:
                logger.info("Loading from checkpoint...")
                return checkpoint_data
        
        # Try to load from latest extraction
        tower_files = list(OUTPUT_DIR.glob("complete_tower_inventory_*.csv"))
        
        if tower_files:
            latest_file = max(tower_files, key=lambda p: p.stat().st_mtime)
            logger.info(f"Loading from: {latest_file}")
            df = pd.read_csv(latest_file)
            logger.info(f"✓ Loaded {len(df)} Nova Corrente towers")
            
            # Save checkpoint
            if progress_tracker:
                progress_tracker.save_checkpoint('load_towers', df)
                progress_tracker.mark_step_completed('load_towers')
            
            return df
        
        # If no existing file, extract from sources
        logger.info("No existing tower inventory found - extracting from sources...")
        extractor = TowerLocationExtractor()
        df = extractor.consolidate_all_locations()
        
        # Save for future use
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_file = OUTPUT_DIR / f"complete_tower_inventory_{timestamp}.csv"
        df.to_csv(output_file, index=False, encoding='utf-8')
        
        # Save checkpoint
        if progress_tracker:
            progress_tracker.save_checkpoint('load_towers', df)
            progress_tracker.mark_step_completed('load_towers')
        
        return df


def fetch_anatel_all_states() -> pd.DataFrame:
    """Fetch ANATEL towers for all Brazilian states"""
    logger.info("Checking for ANATEL data...")
    
    # Check if ANATEL data exists locally first
    anatel_dir = DATA_DIR / "raw" / "anatel_comprehensive" / "towers"
    tower_csv = anatel_dir / "tower_stations.csv" if anatel_dir.exists() else None
    
    if tower_csv and tower_csv.exists():
        logger.info(f"Found ANATEL CSV file: {tower_csv}")
        try:
            fetcher = EnhancedDataFetcher()
            anatel_fetcher = fetcher.anatel_fetcher
            # Try to parse the file
            towers = anatel_fetcher.parse_anatel_csv(tower_csv)
            if towers:
                df = pd.DataFrame(towers)
                logger.info(f"✓ Loaded {len(df)} ANATEL towers from CSV")
                return df
        except Exception as e:
            logger.warning(f"Could not parse ANATEL CSV: {str(e)}")
    
    logger.info("No ANATEL data found - skipping (external data not required)")
    return pd.DataFrame()


def fetch_opencellid_brazil() -> pd.DataFrame:
    """Fetch OpenCellID data for Brazil"""
    logger.info("Checking for OpenCellID data...")
    
    # Check for local OpenCellID files
    opencellid_dir = DATA_DIR / "raw"
    opencellid_files = list(opencellid_dir.glob("**/*opencellid*.csv"))
    opencellid_files.extend(list(opencellid_dir.glob("**/*cell*tower*.csv")))
    
    if opencellid_files:
        logger.info(f"Found {len(opencellid_files)} OpenCellID files")
        try:
            fetcher = EnhancedDataFetcher()
            opencellid_fetcher = fetcher.opencellid_fetcher
            df = opencellid_fetcher._process_opencellid_file(opencellid_files[0], sample_size=100000)
            if not df.empty:
                logger.info(f"✓ Loaded {len(df)} OpenCellID towers")
                return df
        except Exception as e:
            logger.warning(f"Could not process OpenCellID file: {str(e)}")
    
    logger.info("No OpenCellID data found - skipping (external data not required)")
    return pd.DataFrame()


def fetch_web_sources() -> pd.DataFrame:
    """Fetch tower data from web sources"""
    logger.info("Skipping web scraping (not implemented yet)")
    return pd.DataFrame()


def match_all_sources(nc_towers: pd.DataFrame, external_sources: list) -> tuple:
    """
    Match and merge all data sources
    
    Args:
        nc_towers: Nova Corrente tower DataFrame
        external_sources: List of (source_name, DataFrame) tuples
        
    Returns:
        Tuple of (nc_towers_merged, matched_towers_df)
    """
    logger.info("Matching and merging all data sources...")
    
    # Filter out empty sources
    valid_sources = [(name, df) for name, df in external_sources if not df.empty]
    
    if not valid_sources:
        logger.info("No external sources to match - returning original towers")
        return nc_towers, pd.DataFrame()
    
    # Build spatial index for Nova Corrente towers
    nc_index = SpatialIndex(nc_towers) if not nc_towers.empty else None
    
    matched_towers = []
    
    # Match each external source
    for source_name, external_df in valid_sources:
        logger.info(f"Matching {source_name} ({len(external_df)} towers)...")
        
        if nc_index:
            matched = nc_index.match_external_towers(external_df, max_distance_m=100)
            matched['external_source'] = source_name
            matched_towers.append(matched)
        else:
            # No NC towers to match against
            external_df = external_df.copy()
            external_df['external_source'] = source_name
            external_df['matched'] = False
            matched_towers.append(external_df)
    
    # Combine all matched towers
    if matched_towers:
        all_matched = pd.concat(matched_towers, ignore_index=True)
    else:
        all_matched = pd.DataFrame()
    
    # Merge with Nova Corrente towers
    nc_towers_merged = nc_towers.copy()
    if not nc_towers_merged.empty:
        # Add match information to NC towers
        nc_towers_merged['matched_external_sources'] = None
        nc_towers_merged['external_match_count'] = 0
        
        if not all_matched.empty and 'matched_tower_id' in all_matched.columns:
            # Count matches per NC tower
            matched_nc_ids = all_matched[all_matched['matched'] == True]['matched_tower_id'].value_counts()
            
            for tower_id, count in matched_nc_ids.items():
                mask = nc_towers_merged['tower_id'] == tower_id
                if mask.any():
                    nc_towers_merged.loc[mask, 'external_match_count'] = count
                    sources = all_matched[
                        (all_matched['matched_tower_id'] == tower_id) & 
                        (all_matched['matched'] == True)
                    ]['external_source'].unique().tolist()
                    nc_towers_merged.loc[mask, 'matched_external_sources'] = str(sources)
    
    logger.info(f"✓ Matched and merged {len(all_matched)} external towers")
    
    return nc_towers_merged, all_matched


def identify_coverage_gaps(nc_towers: pd.DataFrame, external_towers: pd.DataFrame) -> pd.DataFrame:
    """Identify coverage gaps"""
    logger.info("Identifying coverage gaps...")
    
    analyzer = CoverageAnalyzer(nc_towers, external_towers)
    gaps = analyzer.identify_coverage_gaps(
        grid_resolution_km=5,
        min_tower_distance_km=20,
        max_gap_distance_km=50
    )
    
    logger.info(f"✓ Identified {len(gaps)} coverage gaps")
    return gaps


def enrich_locations(df: pd.DataFrame) -> pd.DataFrame:
    """Enrich tower locations with additional metadata"""
    logger.info("Enriching tower locations...")
    
    enricher = LocationEnricher()
    enriched = enricher.enrich_all(df)
    
    logger.info(f"✓ Enriched {len(enriched)} tower locations")
    return enriched


def generate_enhanced_report(enriched_df: pd.DataFrame, gaps_df: pd.DataFrame, 
                            matched_df: pd.DataFrame) -> Dict[str, Path]:
    """Generate enhanced reports with coverage analysis"""
    logger.info("Generating enhanced reports...")
    
    # Generate standard reports
    generator = TowerLocationReportGenerator(enriched_df)
    reports = generator.generate_all_reports()
    
    # Generate coverage analysis report
    coverage_analysis = {
        'generation_date': datetime.now().isoformat(),
        'total_towers': len(enriched_df),
        'coverage_gaps': {
            'total_gaps': len(gaps_df),
            'high_priority_gaps': len(gaps_df[gaps_df.get('priority') == 'High']) if not gaps_df.empty else 0,
            'gaps_by_region': gaps_df['priority'].value_counts().to_dict() if not gaps_df.empty and 'priority' in gaps_df.columns else {},
        },
        'external_matches': {
            'total_external_towers': len(matched_df),
            'matched_count': matched_df['matched'].sum() if not matched_df.empty and 'matched' in matched_df.columns else 0,
            'unmatched_count': (~matched_df['matched']).sum() if not matched_df.empty and 'matched' in matched_df.columns else 0,
        },
        'suggestions': gaps_df.to_dict('records') if not gaps_df.empty else [],
    }
    
    # Save coverage analysis
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    coverage_file = OUTPUT_DIR / f"coverage_analysis_{timestamp}.json"
    with open(coverage_file, 'w', encoding='utf-8') as f:
        json.dump(coverage_analysis, f, indent=2, ensure_ascii=False, default=str)
    
    reports['coverage_analysis'] = coverage_file
    logger.info(f"✓ Generated coverage analysis: {coverage_file}")
    
    return reports


def maximize_coverage(resume_from_checkpoint: bool = True) -> pd.DataFrame:
    """
    Main function to maximize tower coverage
    
    Args:
        resume_from_checkpoint: Whether to resume from checkpoint if available
        
    Returns:
        Enhanced DataFrame with all tower data
    """
    logger.info("=" * 80)
    logger.info("MAXIMIZING TOWER COVERAGE")
    logger.info("=" * 80)
    
    # Initialize monitoring and tracking
    progress_tracker = ProgressTracker(CHECKPOINT_DIR)
    system_monitor = SystemMonitor(OUTPUT_DIR / "monitoring")
    backup_manager = BackupManager(OUTPUT_DIR / "backups", retention_days=30)
    notification_system = NotificationSystem()
    cache = AdvancedCache(OUTPUT_DIR / "cache", default_ttl=3600)
    cost_optimizer = CostOptimizer()
    profiler = PerformanceProfiler()
    start_time = time.time()
    
    if resume_from_checkpoint:
        summary = progress_tracker.get_progress_summary()
        logger.info(f"Progress: {summary['steps_completed']} completed, {summary['steps_failed']} failed")
    
    # Step 1: Load existing Nova Corrente tower data
    logger.info("\n[Step 1/6] Loading Nova Corrente towers...")
    try:
        nc_towers = load_nova_corrente_towers(progress_tracker)
        if nc_towers.empty:
            raise ValueError("Loaded empty tower DataFrame")
    except Exception as e:
        logger.error(f"Failed to load Nova Corrente towers: {str(e)}")
        if progress_tracker:
            progress_tracker.mark_step_failed('load_towers', str(e))
        raise
    
    # Step 2: Fetch from external sources (optional)
    logger.info("\n[Step 2/6] Checking for external data sources...")
    if progress_tracker.is_step_completed('fetch_external'):
        logger.info("Skipping external fetch - already completed")
        anatel_towers = pd.DataFrame()
        opencellid_towers = pd.DataFrame()
        web_towers = pd.DataFrame()
    else:
        with timed_operation("Fetching external data sources"):
            anatel_towers, _ = safe_execute(
                lambda: fetch_anatel_all_states(),
                default_return=pd.DataFrame(),
                operation_name="Fetch ANATEL",
                timeout=TIMEOUTS['fetch_external'] // 3,
                max_retries=1
            )
            
            opencellid_towers, _ = safe_execute(
                lambda: fetch_opencellid_brazil(),
                default_return=pd.DataFrame(),
                operation_name="Fetch OpenCellID",
                timeout=TIMEOUTS['fetch_external'] // 3,
                max_retries=1
            )
            
            web_towers, _ = safe_execute(
                lambda: fetch_web_sources(),
                default_return=pd.DataFrame(),
                operation_name="Fetch Web Sources",
                timeout=TIMEOUTS['fetch_external'] // 3,
                max_retries=1
            )
            
            if progress_tracker:
                progress_tracker.mark_step_completed('fetch_external')
    
    external_sources = [
        ('ANATEL', anatel_towers),
        ('OpenCellID', opencellid_towers),
        ('Web', web_towers),
    ]
    
    # Count non-empty sources
    non_empty_sources = [name for name, df in external_sources if not df.empty]
    if non_empty_sources:
        logger.info(f"Found external data from: {', '.join(non_empty_sources)}")
    else:
        logger.info("No external data sources available - continuing with Nova Corrente data only")
    
    # Step 3: Match and merge all sources (if external data available)
    logger.info("\n[Step 3/6] Processing data sources...")
    if progress_tracker.is_step_completed('match_sources'):
        logger.info("Skipping matching - already completed")
        matched_towers = pd.DataFrame()
    elif non_empty_sources:
        with timed_operation("Matching and merging sources"):
            result, success = safe_execute(
                lambda: match_all_sources(nc_towers, external_sources),
                default_return=(nc_towers, pd.DataFrame()),
                operation_name="Match Sources",
                timeout=TIMEOUTS['match_sources'],
                max_retries=1
            )
            if success:
                nc_towers_merged, matched_towers = result
                nc_towers = nc_towers_merged
                if progress_tracker:
                    progress_tracker.save_checkpoint('match_sources', matched_towers)
                    progress_tracker.mark_step_completed('match_sources')
            else:
                matched_towers = pd.DataFrame()
                logger.warning("Matching failed - continuing without external matches")
    else:
        matched_towers = pd.DataFrame()
        logger.info("Skipping external matching - no external data available")
        if progress_tracker:
            progress_tracker.mark_step_completed('match_sources')
    
    # Step 4: Identify coverage gaps
    logger.info("\n[Step 4/6] Identifying coverage gaps...")
    if progress_tracker.is_step_completed('identify_gaps'):
        logger.info("Skipping gap identification - already completed")
        gaps = pd.DataFrame()
    else:
        external_dfs = [df for _, df in external_sources if not df.empty]
        if external_dfs:
            all_external = pd.concat(external_dfs, ignore_index=True)
        else:
            all_external = pd.DataFrame()
        
        with timed_operation("Identifying coverage gaps"):
            gaps, success = safe_execute(
                lambda: identify_coverage_gaps(nc_towers, all_external),
                default_return=pd.DataFrame(),
                operation_name="Identify Coverage Gaps",
                timeout=TIMEOUTS['identify_gaps'],
                max_retries=1
            )
            
            if success and not gaps.empty:
                if progress_tracker:
                    progress_tracker.save_checkpoint('identify_gaps', gaps)
                    progress_tracker.mark_step_completed('identify_gaps')
            else:
                logger.warning("Coverage gap analysis failed or returned empty - continuing")
                gaps = pd.DataFrame()
    
    # Step 5: Enrich locations
    logger.info("\n[Step 5/6] Enriching locations...")
    if progress_tracker.is_step_completed('enrich_locations'):
        logger.info("Skipping enrichment - already completed")
        enriched = nc_towers
    else:
        with timed_operation("Enriching locations"):
            # First: Standard enrichment
            enriched, success = safe_execute(
                lambda: enrich_locations(nc_towers),
                default_return=nc_towers,
                operation_name="Enrich Locations",
                timeout=TIMEOUTS['enrich_locations'] // 2,
                max_retries=1
            )
            
            if not success or enriched.empty:
                logger.warning("Standard enrichment failed - using original data")
                enriched = nc_towers
            
            # Second: Integrate research assets
            logger.info("Integrating manual research assets...")
            try:
                enriched = integrate_research_assets(enriched)
                logger.info("✓ Research assets integrated")
            except Exception as e:
                logger.warning(f"Research asset integration failed: {str(e)} - continuing without research data")
            
            if not enriched.empty:
                if progress_tracker:
                    progress_tracker.save_checkpoint('enrich_locations', enriched)
                    progress_tracker.mark_step_completed('enrich_locations')
    
    # Step 6: Validate data
    logger.info("\n[Step 6/6] Validating data...")
    with timed_operation("Validating data"):
        validator = DataValidator()
        validation_results, success = safe_execute(
            lambda: validator.validate_all(enriched, expected_count=18000),
            default_return={},
            operation_name="Validate Data",
            timeout=TIMEOUTS['validate_data'],
            max_retries=1
        )
        
        if not success:
            logger.warning("Validation failed - creating minimal validation results")
            validation_results = {'summary': {'overall_status': 'UNKNOWN'}}
    
    # Save validation results
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    validation_file = OUTPUT_DIR / f"validation_results_{timestamp}.json"
    with open(validation_file, 'w', encoding='utf-8') as f:
        json.dump(validation_results, f, indent=2, ensure_ascii=False, default=str)
    
    logger.info(f"✓ Validation results saved: {validation_file}")
    
    # Generate enhanced reports
    logger.info("\n[Bonus] Generating enhanced reports...")
    with timed_operation("Generating enhanced reports"):
        reports, success = safe_execute(
            lambda: generate_enhanced_report(enriched, gaps, matched_towers),
            default_return={},
            operation_name="Generate Reports",
            timeout=TIMEOUTS['generate_reports'],
            max_retries=1
        )
        
        if not success:
            logger.warning("Report generation failed - some reports may be missing")
            reports = {}
    
    # Apply advanced features
    logger.info("\n[Bonus] Applying advanced features...")
    try:
        enhanced_df, analytics_report = apply_advanced_features(enriched)
        logger.info("✓ Advanced features applied")
        
        # Save analytics report
        analytics_file = OUTPUT_DIR / f"analytics_report_{timestamp}.json"
        with open(analytics_file, 'w', encoding='utf-8') as f:
            json.dump(analytics_report, f, indent=2, ensure_ascii=False, default=str)
        logger.info(f"✓ Analytics report saved: {analytics_file}")
    except Exception as e:
        logger.warning(f"Advanced features failed: {str(e)} - using standard data")
        enhanced_df = enriched
        analytics_report = {}
    
    # Optimize for large datasets
    logger.info("\n[Bonus] Optimizing for large datasets...")
    try:
        enhanced_df = optimize_for_large_datasets(enhanced_df)
        logger.info("✓ Dataset optimization complete")
    except Exception as e:
        logger.warning(f"Optimization failed: {str(e)}")
    
    # Export to all formats (standard)
    logger.info("\n[Bonus] Exporting to standard formats...")
    try:
        export_manager = ExportManager(enhanced_df, OUTPUT_DIR)
        exports = export_manager.export_all_formats("enhanced_tower_inventory")
        logger.info(f"✓ Exported to {len(exports)} standard formats")
    except Exception as e:
        logger.warning(f"Standard export failed: {str(e)}")
        exports = {}
    
    # Export to advanced formats
    logger.info("\n[Bonus] Exporting to advanced formats...")
    try:
        advanced_export_manager = AdvancedExportManager(enhanced_df, OUTPUT_DIR)
        advanced_exports = advanced_export_manager.export_all_formats_advanced("enhanced_tower_inventory")
        logger.info(f"✓ Exported to {len(advanced_exports)} advanced formats")
        exports.update(advanced_exports)
    except Exception as e:
        logger.warning(f"Advanced export failed: {str(e)}")
    
    # ML Predictive Analytics
    logger.info("\n[Bonus] Running ML predictive analytics...")
    try:
        ml_analytics = PredictiveAnalytics(enhanced_df)
        enhanced_df = ml_analytics.predict_coverage_demand(future_days=30)
        enhanced_df = ml_analytics.predict_maintenance_needs()
        enhanced_df = ml_analytics.optimize_tower_placement(target_coverage=95.0)
        
        ml_insights = ml_analytics.generate_ml_insights()
        ml_file = OUTPUT_DIR / f"ml_insights_{timestamp}.json"
        with open(ml_file, 'w', encoding='utf-8') as f:
            json.dump(ml_insights, f, indent=2, ensure_ascii=False, default=str)
        logger.info(f"✓ ML analytics complete: {ml_file}")
    except Exception as e:
        logger.warning(f"ML analytics failed: {str(e)}")
    
    # Create enhanced visualizations
    logger.info("\n[Bonus] Creating enhanced visualizations...")
    try:
        visualizer = EnhancedVisualizer(enhanced_df, OUTPUT_DIR / "visualizations")
        visualizer.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Create maps
        main_map = visualizer.create_interactive_map("tower_map.html")
        regional_maps = visualizer.create_regional_maps()
        
        # Create charts
        charts = visualizer.create_statistical_charts()
        
        # Create dashboard
        dashboard = visualizer.create_dashboard_html(regional_maps, charts)
        
        logger.info(f"✓ Created {len(regional_maps)} regional maps, {len(charts)} charts, and dashboard")
    except Exception as e:
        logger.warning(f"Visualization failed: {str(e)}")
    
    # Cost optimization report
    logger.info("\n[Bonus] Generating cost optimization report...")
    try:
        cost_report = cost_optimizer.generate_cost_report()
        cost_file = OUTPUT_DIR / f"cost_optimization_report_{timestamp}.json"
        with open(cost_file, 'w', encoding='utf-8') as f:
            json.dump(cost_report, f, indent=2, ensure_ascii=False, default=str)
        logger.info(f"✓ Cost report saved: {cost_file}")
        logger.info(f"  Estimated total cost: ${cost_report['costs']['total_cost']:.4f}")
    except Exception as e:
        logger.warning(f"Cost optimization failed: {str(e)}")
    
    # Performance profiling
    logger.info("\n[Bonus] Generating performance profile...")
    try:
        performance_report = profiler.generate_performance_report(
            OUTPUT_DIR / f"performance_profile_{timestamp}.json"
        )
        bottlenecks = profiler.identify_bottlenecks(threshold_seconds=1.0)
        if bottlenecks:
            logger.info(f"  Found {len(bottlenecks)} performance bottlenecks")
            for bottleneck in bottlenecks[:5]:  # Top 5
                logger.info(f"    - {bottleneck['function']}: {bottleneck['average_time']:.2f}s avg")
    except Exception as e:
        logger.warning(f"Performance profiling failed: {str(e)}")
    
    # Advanced reporting
    logger.info("\n[Bonus] Generating advanced comprehensive report...")
    try:
        reporter = AdvancedReporter(enhanced_df, OUTPUT_DIR / "reports")
        comprehensive_report = reporter.generate_comprehensive_report("tower_location_comprehensive")
        logger.info(f"✓ Comprehensive report saved: {comprehensive_report}")
    except Exception as e:
        logger.warning(f"Advanced reporting failed: {str(e)}")
    
    # Backend API Integration
    logger.info("\n[Bonus] Integrating with backend API...")
    try:
        backend_url = os.getenv('BACKEND_URL', 'http://localhost:8000')
        backend_client = BackendAPIClient(backend_url)
        
        # Check backend health
        health = backend_client.health_check()
        if health.get('status') == 'healthy':
            logger.info("✓ Backend API is healthy")
            
            # Enrich with backend features
            enhanced_df = backend_client.enrich_towers_with_backend_features(enhanced_df)
            
            # Submit to backend
            submit_result = backend_client.submit_tower_data(enhanced_df)
            if submit_result.get('success'):
                logger.info(f"✓ Successfully submitted {submit_result.get('total_towers', 0)} towers to backend")
            else:
                logger.warning(f"Backend submission had issues: {submit_result.get('error', 'Unknown')}")
        else:
            logger.warning(f"Backend API not available: {health.get('error', 'Unknown')}")
    except Exception as e:
        logger.warning(f"Backend integration failed: {str(e)}")
    
    # Categorical Features Integration
    logger.info("\n[Bonus] Generating categorical features integration...")
    try:
        categorical_integration = TowerCategoricalIntegration(enhanced_df)
        enhanced_df = categorical_integration.generate_site_categorical_features()
        categorical_payload = categorical_integration.generate_categorical_encodings_payload()
        
        categorical_file = OUTPUT_DIR / f"categorical_features_{timestamp}.json"
        with open(categorical_file, 'w', encoding='utf-8') as f:
            json.dump(categorical_payload, f, indent=2, ensure_ascii=False, default=str)
        logger.info(f"✓ Categorical features saved: {categorical_file}")
    except Exception as e:
        logger.warning(f"Categorical integration failed: {str(e)}")
    
    # Route Planning Optimization
    logger.info("\n[Bonus] Optimizing maintenance routes...")
    try:
        route_planner = TowerRoutePlanner(enhanced_df)
        route_report = route_planner.generate_route_planning_report()
        
        route_file = OUTPUT_DIR / f"route_planning_{timestamp}.json"
        with open(route_file, 'w', encoding='utf-8') as f:
            json.dump(route_report, f, indent=2, ensure_ascii=False, default=str)
        logger.info(f"✓ Route planning saved: {route_file}")
        logger.info(f"  Total routes: {route_report['summary']['total_routes']}")
        logger.info(f"  Total distance: {route_report['summary']['total_distance_km']:.2f} km")
    except Exception as e:
        logger.warning(f"Route planning failed: {str(e)}")
    
    # 5G Integration
    logger.info("\n[Bonus] Generating 5G expansion features...")
    try:
        tower_5g = Tower5GIntegration(enhanced_df)
        enhanced_df = tower_5g.identify_5g_expansion_candidates()
        fiveg_payload = tower_5g.generate_5g_features_payload()
        
        fiveg_file = OUTPUT_DIR / f"5g_features_{timestamp}.json"
        with open(fiveg_file, 'w', encoding='utf-8') as f:
            json.dump(fiveg_payload, f, indent=2, ensure_ascii=False, default=str)
        logger.info(f"✓ 5G features saved: {fiveg_file}")
        logger.info(f"  Expansion candidates: {fiveg_payload['coverage_expansion_map']['expansion_candidates']}")
    except Exception as e:
        logger.warning(f"5G integration failed: {str(e)}")
    
    # Hierarchical Features Integration
    logger.info("\n[Bonus] Generating hierarchical features...")
    try:
        hierarchical = HierarchicalFeaturesIntegration(enhanced_df)
        enhanced_df = hierarchical.calculate_hierarchical_aggregations()
        hierarchical_payload = hierarchical.generate_hierarchical_payload()
        
        hierarchical_file = OUTPUT_DIR / f"hierarchical_features_{timestamp}.json"
        with open(hierarchical_file, 'w', encoding='utf-8') as f:
            json.dump(hierarchical_payload, f, indent=2, ensure_ascii=False, default=str)
        logger.info(f"✓ Hierarchical features saved: {hierarchical_file}")
        logger.info(f"  Regions: {hierarchical_payload['summary']['total_regions']}")
        logger.info(f"  Zones: {hierarchical_payload['summary']['total_zones']}")
    except Exception as e:
        logger.warning(f"Hierarchical integration failed: {str(e)}")
    
    # Frontend Integration
    logger.info("\n[Bonus] Exporting frontend-ready data...")
    try:
        frontend_exports = FrontendIntegrationHelper.export_for_frontend(
            enhanced_df, 
            OUTPUT_DIR / "frontend"
        )
        logger.info(f"✓ Frontend exports complete: {len(frontend_exports)} files")
        for export_type, export_path in frontend_exports.items():
            logger.info(f"  {export_type}: {export_path.name}")
    except Exception as e:
        logger.warning(f"Frontend export failed: {str(e)}")
    
    # Enhanced quality check
    logger.info("\n[Bonus] Running enhanced quality check...")
    try:
        quality_checker = EnhancedDataQuality(enhanced_df)
        quality_report = quality_checker.comprehensive_quality_check()
        
        if quality_report['overall_score'] < 90:
            logger.warning(f"Quality score below threshold: {quality_report['overall_score']}/100")
            enhanced_df = quality_checker.apply_quality_fixes()
            logger.info("✓ Quality fixes applied")
        
        quality_file = OUTPUT_DIR / f"enhanced_quality_report_{timestamp}.json"
        with open(quality_file, 'w', encoding='utf-8') as f:
            json.dump(quality_report, f, indent=2, ensure_ascii=False, default=str)
        logger.info(f"✓ Quality report saved: {quality_file}")
    except Exception as e:
        logger.warning(f"Enhanced quality check failed: {str(e)}")
    
    # Save final enhanced dataset
    final_file = OUTPUT_DIR / f"enhanced_tower_inventory_{timestamp}.csv"
    enhanced_df.to_csv(final_file, index=False, encoding='utf-8')
    logger.info(f"✓ Enhanced inventory saved: {final_file}")
    
    # Create backup
    try:
        backup_manager.create_backup(final_file)
        logger.info("✓ Backup created")
    except Exception as e:
        logger.warning(f"Backup failed: {str(e)}")
    
    # Cleanup old backups
    try:
        backup_manager.cleanup_old_backups()
    except Exception as e:
        logger.warning(f"Backup cleanup failed: {str(e)}")
    
    # Record execution metrics
    execution_time = time.time() - start_time
    system_monitor.record_execution({
        'duration': execution_time,
        'towers_processed': len(enhanced_df),
        'success': True,
        'steps_completed': progress_tracker.progress.get('steps_completed', []),
        'errors': progress_tracker.progress.get('steps_failed', []),
    })
    
    # Generate dashboard
    try:
        dashboard_html = system_monitor.generate_dashboard_html()
        dashboard_file = OUTPUT_DIR / "monitoring" / "dashboard.html"
        with open(dashboard_file, 'w', encoding='utf-8') as f:
            f.write(dashboard_html)
        logger.info(f"✓ Dashboard generated: {dashboard_file}")
    except Exception as e:
        logger.warning(f"Dashboard generation failed: {str(e)}")
    
    # Data health monitoring
    try:
        logger.info("\n[Bonus] Checking data health...")
        health_monitor = DataHealthMonitor(OUTPUT_DIR)
        health_report = health_monitor.generate_health_report(enhanced_df)
        
        health_file = OUTPUT_DIR / f"health_report_{timestamp}.json"
        with open(health_file, 'w', encoding='utf-8') as f:
            json.dump(health_report, f, indent=2, ensure_ascii=False, default=str)
        logger.info(f"✓ Health report saved: {health_file}")
        logger.info(f"  Health Score: {health_report['current_health']['overall_score']}/100 ({health_report['current_health']['status']})")
        logger.info(f"  Trend: {health_report['trends']['trend']}")
    except Exception as e:
        logger.warning(f"Health monitoring failed: {str(e)}")
    
    logger.info("=" * 80)
    logger.info("COVERAGE MAXIMIZATION COMPLETE")
    logger.info("=" * 80)
    logger.info(f"Total towers: {len(enhanced_df)}")
    logger.info(f"Coverage gaps identified: {len(gaps)}")
    if not matched_towers.empty and 'matched' in matched_towers.columns:
        logger.info(f"External towers matched: {matched_towers['matched'].sum()}")
    else:
        logger.info("External towers matched: 0 (no external data available)")
    logger.info(f"Validation status: {validation_results['summary']['overall_status']}")
    logger.info(f"Execution time: {execution_time:.2f} seconds")
    logger.info(f"Quality score: {analytics_report.get('quality', {}).get('quality_score', 'N/A')}")
    
    # Send notifications
    try:
        execution_data = {
            'duration': execution_time,
            'towers_processed': len(enhanced_df),
            'success': True
        }
        notification_system.notify_completion(execution_data)
    except Exception as e:
        logger.debug(f"Notification failed: {str(e)}")
    
    return enhanced_df


def main():
    """Main execution function"""
    try:
        enhanced_df = maximize_coverage(resume_from_checkpoint=True)
        
        print("\n" + "=" * 80)
        print("SUCCESS: Tower coverage maximization complete!")
        print("=" * 80)
        print(f"Total towers processed: {len(enhanced_df)}")
        print(f"Output directory: {OUTPUT_DIR}")
        print("\nGenerated files:")
        for file in OUTPUT_DIR.glob("*"):
            if file.is_file():
                print(f"  - {file.name}")
        
    except Exception as e:
        logger.error(f"Error during coverage maximization: {str(e)}", exc_info=True)
        raise


if __name__ == '__main__':
    main()

