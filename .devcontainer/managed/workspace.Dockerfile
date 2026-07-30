FROM mcr.microsoft.com/playwright:v1.62.0-noble

RUN apt-get update \
    && apt-get install --yes --no-install-recommends git unzip zip zsh \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir --parents /workspace/node_modules \
    && chown --recursive pwuser:pwuser /workspace

USER pwuser
WORKDIR /workspace
