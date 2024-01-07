# Endpoints

## SUCCESS RESPONSES

### 200 OK
```json
{
    "status": "success",
    "data": "${data}"
}
```

### 201 Created
```json
{
    "status": "success",
}
```

### 204 No Content
```json
{
    "status": "success"
}
```


## ERROR RESPONSES

### 400 Bad Request
```json
{
    "status": "error",
    "message": "${message}",
    "code": "${code}"
}
```

### 401 Unauthorized
```json
{
    "status": "error",
    "message": "${message}",
    "code": "${code}"
}
```

### 403 Forbidden
```json
{
    "status": "error",
    "message": "${message}",
    "code": "${code}"
}
```

### 404 Not Found
```json
{
    "status": "error",
    "message": "${message}",
    "code": "${code}"
}
``` 

### 405 Method Not Allowed
```json
{
    "status": "error",
    "message": "${message}",
    "code": "${code}"
}
```

### 409 Conflict
```json
{
    "status": "error",
    "message": "${message}",
    "code": "${code}"
}
```

### 500 Internal Server Error
```json
{
    "status": "error",
    "message": "${message}",
    "code": "internal_server_error"
}
```
