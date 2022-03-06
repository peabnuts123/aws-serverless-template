# Builder container
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build

WORKDIR /app

# Copy project manifests
COPY MyProject.sln MyProject.sln
COPY MyProject.Business/MyProject.Business.csproj MyProject.Business/MyProject.Business.csproj
COPY MyProject.Common/MyProject.Common.csproj MyProject.Common/MyProject.Common.csproj
COPY MyProject.Config/MyProject.Config.csproj MyProject.Config/MyProject.Config.csproj
COPY MyProject.Data/MyProject.Data.csproj MyProject.Data/MyProject.Data.csproj
COPY MyProject.Web/MyProject.Web.csproj MyProject.Web/MyProject.Web.csproj
COPY MyProject.Scripts/MyProject.Scripts.csproj MyProject.Scripts/MyProject.Scripts.csproj

# @TODO tests 😇
# COPY MyProject.Common.Test/MyProject.Common.Test.csproj MyProject.Common.Test/MyProject.Common.Test.csproj
# COPY MyProject.Business.Test/MyProject.Business.Test.csproj MyProject.Business.Test/MyProject.Business.Test.csproj

# Restore packages (from csproj manifests)
RUN dotnet restore

# Copy the rest of the project
COPY . .

# Used by build process to include/omit files
ENV ENVIRONMENT_ID=docker

# Build the project
RUN dotnet publish --configuration Debug


# Runtime container
FROM mcr.microsoft.com/dotnet/aspnet:6.0-alpine AS runtime

WORKDIR /app

RUN adduser -D MyProject
USER MyProject

COPY --from=build /app/MyProject.Web/bin/Debug/net6.0/publish/* ./

ENV ASPNETCORE_ENVIRONMENT=Development
ENV PROJECT_ID=my-project
ENV ENVIRONMENT_ID=docker

ENTRYPOINT ["dotnet", "MyProject.Web.dll"]

