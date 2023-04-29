#!/bin/bash
echo ECS_CLUSTER='${ecs_cluster_name}' >> /etc/ecs/ecs.config

# Install AWS CLI
sudo yum -y upgrade
sudo yum -y install unzip
curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Update DNS
IP=$( curl http://169.254.169.254/latest/meta-data/public-ipv4 )
HOSTED_ZONE_ID=$( aws route53 list-hosted-zones-by-name | grep -B 1 -e $(sed 's/.*\.\(.*\..*\)/\1/' <<< ${domain}) | sed 's/.*hostedzone\/\([A-Za-z0-9]*\)\".*/\1/' | head -n 1 )

file=/tmp/record.json
cat << EOF > $file
{
  "Comment": "Update the A record set",
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "${domain}",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [
          {
            "Value": "$IP"
          }
        ]
      }
    }
  ]
}
EOF

aws route53 change-resource-record-sets --hosted-zone-id "$HOSTED_ZONE_ID" --change-batch file://$file
