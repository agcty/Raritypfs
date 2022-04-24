@app
raritypfs

@http
get /collection
post /collection

@aws
# profile default
runtime typescript # sets TS as the the default runtime for your entire project
timeout 900
region us-west-2
architecture arm64

@plugins
architect/plugin-typescript

@typescript
# Build into `./dist`
build dist
esbuild-config esbuild-config.js