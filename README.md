# carte-tresor

### if you don't have yarn installed 
```npm install --global yarn```

### install packages from package.json
```yarn```

### install also package on /src/server folder
```cd /src/server```

```yarn```

### launch server on /src/server
```node server.js```

### launch front on root folder /carte-tresor
```yarn dev```  

open [localhost:5252](http://localhost:5252)
- upload map file, examples of map given in /maps folder 
- you can change the time (in **ms**) between moves in main.utils.ts : **TIME_BETWEEN_MOVES**

### to launch unit tests with jest
```yarn test```