#!/usr/bin/env python3
"""
GitHub Actions Workflow Validator

This script validates GitHub Actions workflow YAML files for syntax errors
and common configuration issues.
"""

import os
import sys
import yaml
from pathlib import Path
from typing import Dict, List, Any, Optional

class WorkflowValidator:
    def __init__(self, workflows_dir: str = ".github/workflows"):
        self.workflows_dir = Path(workflows_dir)
        self.errors = []
        self.warnings = []

    def validate_all_workflows(self) -> bool:
        """Validate all workflow files in the directory."""
        if not self.workflows_dir.exists():
            self.errors.append(f"Workflows directory {self.workflows_dir} does not exist")
            return False

        workflow_files = list(self.workflows_dir.glob("*.yml")) + list(self.workflows_dir.glob("*.yaml"))

        if not workflow_files:
            self.warnings.append("No workflow files found")
            return True

        all_valid = True
        for workflow_file in workflow_files:
            if not self.validate_workflow(workflow_file):
                all_valid = False

        return all_valid

    def validate_workflow(self, workflow_file: Path) -> bool:
        """Validate a single workflow file."""
        print(f"Validating {workflow_file.name}...")

        try:
            with open(workflow_file, 'r', encoding='utf-8') as f:
                content = f.read()

            # Parse YAML
            try:
                workflow_data = yaml.safe_load(content)
            except yaml.YAMLError as e:
                self.errors.append(f"{workflow_file.name}: YAML syntax error: {e}")
                return False

            # Validate workflow structure
            if not isinstance(workflow_data, dict):
                self.errors.append(f"{workflow_file.name}: Workflow must be a dictionary")
                return False

            # Check required top-level keys
            if 'name' not in workflow_data:
                self.warnings.append(f"{workflow_file.name}: Missing 'name' field")

            if 'on' not in workflow_data:
                self.errors.append(f"{workflow_file.name}: Missing 'on' field (required)")
                return False

            # Validate jobs section
            if 'jobs' in workflow_data:
                if not self.validate_jobs(workflow_data, workflow_file.name):
                    return False

            print(f"  ✅ {workflow_file.name} is valid")
            return True

        except Exception as e:
            self.errors.append(f"{workflow_file.name}: Unexpected error: {e}")
            return False

    def validate_jobs(self, workflow_data: Dict[str, Any], workflow_name: str) -> bool:
        """Validate the jobs section of a workflow."""
        jobs = workflow_data['jobs']

        if not isinstance(jobs, dict):
            self.errors.append(f"{workflow_name}: 'jobs' must be a dictionary")
            return False

        if not jobs:
            self.errors.append(f"{workflow_name}: 'jobs' cannot be empty")
            return False

        all_valid = True

        for job_name, job_config in jobs.items():
            if not isinstance(job_config, dict):
                self.errors.append(f"{workflow_name}: Job '{job_name}' must be a dictionary")
                all_valid = False
                continue

            # Check required job fields
            if 'runs-on' not in job_config:
                self.errors.append(f"{workflow_name}: Job '{job_name}' missing 'runs-on' field")
                all_valid = False

            # Validate steps if present
            if 'steps' in job_config:
                if not self.validate_steps(job_config['steps'], workflow_name, job_name):
                    all_valid = False

        return all_valid

    def validate_steps(self, steps: List[Dict[str, Any]], workflow_name: str, job_name: str) -> bool:
        """Validate the steps section of a job."""
        if not isinstance(steps, list):
            self.errors.append(f"{workflow_name}: Job '{job_name}' 'steps' must be a list")
            return False

        if not steps:
            self.warnings.append(f"{workflow_name}: Job '{job_name}' has no steps")
            return True

        all_valid = True

        for i, step in enumerate(steps):
            if not isinstance(step, dict):
                self.errors.append(f"{workflow_name}: Job '{job_name}' step {i+1} must be a dictionary")
                all_valid = False
                continue

            # Check for uses or run
            if 'uses' not in step and 'run' not in step:
                self.warnings.append(f"{workflow_name}: Job '{job_name}' step {i+1} has neither 'uses' nor 'run'")

            # Check for deprecated actions
            if 'uses' in step:
                uses_str = step['uses']
                if 'lewagon/wait-on-check-action' in uses_str:
                    self.warnings.append(f"{workflow_name}: Job '{job_name}' step {i+1} uses deprecated action 'lewagon/wait-on-check-action'")

        return all_valid

    def print_results(self):
        """Print validation results."""
        print("\n" + "="*50)
        print("VALIDATION RESULTS")
        print("="*50)

        if self.errors:
            print(f"\n❌ ERRORS ({len(self.errors)}):")
            for error in self.errors:
                print(f"  • {error}")

        if self.warnings:
            print(f"\n⚠️  WARNINGS ({len(self.warnings)}):")
            for warning in self.warnings:
                print(f"  • {warning}")

        if not self.errors and not self.warnings:
            print("\n✅ All workflows are valid!")
        elif not self.errors:
            print(f"\n✅ All workflows are valid with {len(self.warnings)} warnings")
        else:
            print(f"\n❌ Found {len(self.errors)} error(s) and {len(self.warnings)} warning(s)")

def main():
    """Main function."""
    validator = WorkflowValidator()

    success = validator.validate_all_workflows()
    validator.print_results()

    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())