# docker node
> docker run --name {some_name} {image}

ex) 
> docker run --name node node-basic

# connect MongoDB
 MongoDB also connects network.
> docker network create --driver {network_type} {network_name} \
> \
> docker run -i -t --name {some_name} \     
> --net {network_name}\                                  
> image                         

ex)
> docker network create --driver bridge node-mongo-network \
> \
> docker run -i -t --name node \
> --net node-mongo-network \
> node-basic