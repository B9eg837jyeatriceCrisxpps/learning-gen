# FHE-Driven Personalized Learning Material Generation

A privacy-preserving system that generates personalized practice materials for students based on their encrypted knowledge gaps. The system uses Full Homomorphic Encryption (FHE) to dynamically generate customized exercises from a question bank, ensuring that students' learning progress and weaknesses remain confidential.

## Project Background

Traditional educational systems often struggle to provide personalized learning experiences due to the limitations in tracking students' progress and knowledge gaps. Moreover, privacy concerns prevent schools and educational institutions from fully utilizing students' data for enhancing learning outcomes.

FHE-Driven Personalized Learning Material Generation addresses these issues by:

• Leveraging encrypted student data to preserve privacy  
• Dynamically generating personalized exercises based on each student’s encrypted knowledge map  
• Enabling difficulty adjustments tailored to individual student needs  
• Tracking learning progress securely and anonymously  

By utilizing Full Homomorphic Encryption (FHE), this system ensures that the entire learning process, from the creation of exercises to progress tracking, occurs without exposing sensitive student information.

## Features

### Core Functionality

• **Encrypted Knowledge Graphs**: Students' knowledge gaps are represented in encrypted form, ensuring that no personal information is exposed  
• **Dynamic Exercise Generation**: FHE is used to dynamically generate a set of personalized practice exercises tailored to the student's specific weaknesses  
• **Adaptive Difficulty Adjustment**: The difficulty of the exercises adjusts based on the student’s progress, optimizing learning efficacy  
• **Learning Progress Tracking**: The system tracks students' learning progress securely and privately, ensuring that no personal data is exposed during the process  

### Privacy & Anonymity

• **Client-side Encryption**: All student data is encrypted on the client-side before it is submitted to the system  
• **Fully Encrypted Computations**: FHE ensures that computations on encrypted data can be performed without ever decrypting it  
• **No Personal Data Exposure**: The system operates in a way that no personal or identifiable student data is ever exposed, ensuring complete privacy  

### Customizable Learning Paths

• **Personalized Learning Material**: The generated exercises are tailored to each student’s unique learning needs  
• **Real-time Adjustments**: Difficulty levels and topics are adjusted in real-time based on the student’s learning progress  
• **Comprehensive Feedback**: Students receive feedback on their performance while ensuring that their data remains confidential  

## Architecture

### Smart Algorithms

• **FHE Practice Material Generation Algorithm**: Using encrypted data, the system dynamically generates practice exercises tailored to the student’s encrypted knowledge gaps  
• **Adaptive Difficulty Adjustment**: The system adjusts the difficulty of exercises based on real-time encrypted assessments of student performance  
• **Knowledge Map Integration**: A dynamic, encrypted student knowledge map that tracks progress without exposing sensitive data  

### Frontend Application

• **Flutter + Dart**: A cross-platform mobile and web interface built with Flutter to interact with the FHE backend  
• **FHE Computation Integration**: Direct interaction with the backend FHE algorithms, facilitating real-time exercise generation  
• **Responsive UI/UX**: Interactive, easy-to-navigate interface for students to view and interact with their personalized learning materials  
• **Real-time Feedback**: Immediate feedback on progress and difficulty adjustments  

## Technology Stack

### Blockchain

• **Full Homomorphic Encryption (FHE)**: The core encryption technology used to preserve privacy during all computations  
• **Rust**: Utilized for performance-intensive FHE computations  
• **Python**: Used for orchestrating FHE operations and managing student data securely  
• **AWS KMS**: Key management system for securely managing encryption keys  

### Frontend

• **Flutter + Dart**: A modern framework for building cross-platform applications  
• **FHE Computation Integration**: Flutter integrates seamlessly with the backend FHE computation system for real-time exercise generation  
• **Tailwind CSS**: Styling framework for creating a responsive, user-friendly interface  

## Installation

### Prerequisites

• **Flutter SDK**: Ensure that Flutter is installed and properly configured  
• **Node.js**: Required for building certain frontend components  
• **Python 3.x**: For running the backend FHE algorithms  
• **Rust**: For compiling performance-sensitive FHE operations  

### Setup

1. Clone the repository:
    ```bash
    git clone 
    ```

2. Install dependencies for the frontend:
    - For Flutter:
      ```bash
      flutter pub get
      ```

3. Install Python dependencies for the backend:
    ```bash
    pip install -r backend/requirements.txt
    ```

4. Install Rust dependencies for FHE operations:
    - If not already installed, first install [Rust](https://www.rust-lang.org/tools/install).
    - In the `fhe` directory, run:
      ```bash
      cargo build --release
      ```

5. Configure environment variables for key management and FHE parameters:
    - Copy the `.env.example` file to `.env`:
      ```bash
      cp .env.example .env
      ```
    - Edit the `.env` file with your specific values for the FHE computation and key management.

6. Run the backend:
    ```bash
    python backend/app.py
    ```

7. Run the frontend:
    ```bash
    flutter run
    ```

## Usage

1. **Create an Account**: Students can create an anonymous account to start using the system. No personal data is required.
2. **View Personalized Learning Material**: The system generates a set of exercises based on the student’s encrypted knowledge map.
3. **Track Progress**: As students complete exercises, their encrypted learning progress is tracked and used to adjust future exercises.
4. **Privacy Controls**: Students can opt out at any time and delete their encrypted data from the system.

## Security Features

• **End-to-End Encryption**: All data is encrypted from the moment it is collected, ensuring maximum privacy  
• **Homomorphic Encryption**: Computations are performed on encrypted data, guaranteeing that no raw data is exposed during processing  
• **Immutable Records**: All learning progress and data are stored securely, and cannot be tampered with after submission  
• **Real-time Privacy**: Students' progress is updated in real-time without exposing any personal data  

## Future Enhancements

• **Integration with Learning Management Systems (LMS)**: To enhance the learning experience by integrating with existing LMS platforms  
• **Multilingual Support**: Expanding the platform’s accessibility to non-English speaking students  
• **Advanced Data Analytics**: Implementing advanced analytics features to help educators understand learning patterns and progress  
• **AI-based Difficulty Adjustment**: Leveraging AI for even more personalized learning paths based on student performance  

Built with ❤️ to provide students with a personalized, privacy-preserving learning experience.
