import * as cdk from '@aws-cdk/core';
// import * as sqs from '@aws-cdk/aws-sqs';

import * as ec2 from "@aws-cdk/aws-ec2";            // Allows working with EC2 and VPC resources
import * as iam from "@aws-cdk/aws-iam";            // Allows working with IAM resources
import * as s3assets from "@aws-cdk/aws-s3-assets"; // Allows managing files with S3
import * as keypair from "cdk-ec2-key-pair";        // Helper to create EC2 SSH keypairs
import * as path from "path";                       // Helper for working with file pa
import {readFileSync} from 'fs';                    // import ro read file from 
//import { Asset } from 'aws-cdk-lib/aws-s3-assets';

export class CdkAygoFinalStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
	
	// Look up the default VPC
	const vpc = ec2.Vpc.fromLookup(this, "VPC", {
        isDefault: true
      });
	  
	// Create a key pair to be used with this EC2 Instance
    const key = new keypair.KeyPair(this, "KeyPair", {
      name: "cdk-keypair",
      description: "Key Pair created with CDK Deployment",
    });
    key.grantReadOnPublicKey; 
	
	// Create a key pair to be used with this EC2 Instance
    const key_ins2 = new keypair.KeyPair(this, "KeyPair_2", {
      name: "cdk-keypair_2",
      description: "Key Pair created with CDK Deployment 2",
    });
    key_ins2.grantReadOnPublicKey; 
	
	// Create a key pair to be used with this EC2 Instance
    const key_ins3 = new keypair.KeyPair(this, "KeyPair_3", {
      name: "cdk-keypair_3",
      description: "Key Pair created with CDK Deployment 3",
    });
    key_ins2.grantReadOnPublicKey; 

	// Security group for the EC2 instance
    const securityGroup = new ec2.SecurityGroup(this, "SecurityGroup", {
      vpc,
      description: "Allow SSH (TCP port 22) and HTTP (TCP port 80) in",
      allowAllOutbound: true,
    });

    // Allow SSH access on port tcp/22
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      "Allow SSH Access"
    );

    // Allow HTTP access on port tcp/80
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      "Allow HTTP Access"
    );
	
	// Allow HTTP access on port tcp/5432
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(5432),
      "Allow HTTP Access"
    );

    // IAM role to allow access to other AWS services
    const role = new iam.Role(this, "ec2Role", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
    });

    // IAM policy attachment to allow access to 
    role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore")
    );

    // Look up the AMI Id for the Amazon Linux 2 Image with CPU Type X86_64
    const ami = new ec2.AmazonLinuxImage({
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      cpuType: ec2.AmazonLinuxCpuType.X86_64,
    });
	
	const userDataApp = ec2.UserData.forLinux()
	userDataApp.addCommands(
	'yum update -y',
	'yum install docker -y',
	'service docker start',
	'sudo docker run -d -p 5432:5432 --name pg postgres:9.6 -e POSTGRES_USER=aygo_user -e POSTGRES_PASSWORD=aygo_password -e POSTGRES_DB=aygo -e PGDATA=/tmp'
	)
	
	  // Create the EC2 instance using the Security Group, AMI, and KeyPair defined.
    const ec2Instance = new ec2.Instance(this, "Instance", {
      vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ami,
      securityGroup: securityGroup,
      keyName: key.keyPairName,
      role: role,
	  userData: userDataApp
    });
	
	// Output the public IP address of the EC2 instance
    new cdk.CfnOutput(this, "IP Address", {
      value: ec2Instance.instancePublicIp,
    });
	
	const userDataApp_backend = ec2.UserData.forLinux()
	userDataApp_backend.addCommands(
	'yum update -y',
	'yum install docker -y',
	'service docker start',
	'sudo docker run -d -p 80:8080 --name back 9410ger/projectaygogroup2:9.6 -e DB_HOST=' + ec2Instance.instancePublicIp + ' -e DB_PORT=5432 -e DB_USER=aygo_user -e DB_PASS=aygo_password -e DB_NAME=aygo'
	)
	
	// Create the EC2 instance 2 using the Security Group, AMI, and KeyPair 2 defined. userDataApp_backend
    const ec2Instance_2 = new ec2.Instance(this, "Instance_2", {
      vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ami,
      securityGroup: securityGroup,
      keyName: key_ins2.keyPairName,
      role: role,
	  userData: userDataApp_backend
    });

    // Output the public IP address of the EC2 instance backend
     new cdk.CfnOutput(this, "IP Address back", {
     value: ec2Instance_2.instancePublicIp,
     });  

    const userDataApp_frontend = ec2.UserData.forLinux()
    userDataApp_frontend.addCommands(
    'yum update -y',
    'yum install docker -y',
    'service docker start',
    'sudo docker run -d -p 27017:27017 --name mongodbta dftorresr/taller1_vir_prog_dist'
    //'sudo docker run -d -p 80:8080 --name back 9410ger/projectaygogroup2:9.6 -e DB_HOST=' + ec2Instance_2.instancePublicIp + ' -e DB_PORT=5432 -e DB_USER=aygo_user -e DB_PASS=aygo_password -e DB_NAME=aygo'
    )

	// Create the EC2 instance 3 using the Security Group, AMI, and KeyPair 2 defined. frontend
    const ec2Instance_3 = new ec2.Instance(this, "Instance_3", {
      vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ami,
      securityGroup: securityGroup,
      keyName: key_ins3.keyPairName,
      role: role,
	    userData: userDataApp_frontend
    });
	
	// Create outputs for connecting



    // Command to download the SSH key
    new cdk.CfnOutput(this, "Download Key Command", {
      value:
        "aws secretsmanager get-secret-value --secret-id ec2-ssh-key/cdk-keypair/private --query SecretString --output text > cdk-key.pem && chmod 400 cdk-key.pem",
    });

    // Command to access the EC2 instance using SSH
    new cdk.CfnOutput(this, "ssh command", {
      value:
        "ssh -i cdk-key.pem -o IdentitiesOnly=yes ec2-user@" +
        ec2Instance.instancePublicIp,
    });
	
	
    // example resource
    // const queue = new sqs.Queue(this, 'CdkAygoFinalQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
