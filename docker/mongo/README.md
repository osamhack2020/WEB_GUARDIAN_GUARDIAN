# docker mongo
> docker run --name {container_name} {image}

ex) 
> docker run --name mongo mongo-basic

# docker mongo initialize
> docker run -d --name {container_name} \
> -e MONGO_INITDB_ROOT_USERNAME={admin} \
> -e MONGO_INITDB_ROOT_PASSWORD={password} \
> image

# docker mongo login 
> docker exec -it mongodb mongo -u {admin} -p {password} --authenticationDatabase {database}
> \
> docker exec -it mongodb mongo -u {admin} -p {password} --authenticationDatabase admin

# connect server
 Server also connects network.
> docker network create --driver {network_type} {network_name} \
> \
> docker run -i -t --name {container_name} \     
> --net {network_name} \                                  
> image                         

ex)
> docker network create --driver bridge node-mongo-network \
> \
> docker run -i -t --name mongo \
> --net node-mongo-network \
> mongo-basic
