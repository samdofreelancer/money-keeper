{{/*
Expand the name of the chart.
*/}}
{{- define "money-keeper.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "money-keeper.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "money-keeper.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "money-keeper.labels" -}}
helm.sh/chart: {{ include "money-keeper.chart" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- range $key, $value := .Values.labels }}
{{ $key }}: {{ $value }}
{{- end }}
{{- end }}

{{/*
Selector labels for frontend
*/}}
{{- define "money-keeper.frontend.selectorLabels" -}}
app: money-keeper-frontend
version: v2
{{- end }}

{{/*
Selector labels for backend
*/}}
{{- define "money-keeper.backend.selectorLabels" -}}
app: money-keeper-backend
version: v2
{{- end }}

{{/*
Get container image reference
*/}}
{{- define "money-keeper.image" -}}
{{- printf "%s/%s:%s" .registry .repository .tag }}
{{- end }}

{{/*
Get namespace (use .Values.global.namespace or default)
*/}}
{{- define "money-keeper.namespace" -}}
{{- .Values.global.namespace | default "default" }}
{{- end }}
