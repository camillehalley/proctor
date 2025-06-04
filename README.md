# Proctor: Additional Instructions and Explanations

## Assumptions and scope boxing
* Every survey will include a Select Role question even if there are no dynamic questions 
* Survey questions are still created via seed data rather than UI

## Instructions to run
See existing instructions below for initial setup.
Run npm install recharts to ensure recharts is installed. 
For an example of a branched survey, you can take the new Tools Feedback Survey. The existing surveys should behave as they did previously. 

## Approach Overview

Questions now include an array of string enum values representing the roles to which they apply. If no roles are defined for a question, we treat it as applicable to all roles.

Each survey includes a role selection dropdown as the first element in the view by default. All questions for a given survey are passed into the component as props, and we dynamically filter them based on the selected role using each question’s associated roles. Required questions are filtered from this role-specific subset.

I’ve also introduced the concept of grouping responses by submission. When a survey is submitted, the role is saved on the submission, and all responses are saved with the associated submission_id.

## Approach Explanation
### Lightweight roles
This implementation assumes that the set of roles (like Engineer, Designer, and Product Manager) is relatively static and managed internally. Given that, I’ve used an enum for roles to keep the structure straightforward and lightweight. If we were building a public-facing survey tool where admins could define roles, we’d likely model roles as a separate table and associate them with questions through a join table. That would allow dynamic creation, editing, and access of roles through a UI.

### Flexible branching
Role-based branching is implemented declaratively by attaching an array of roles directly to each question. Questions with no associated roles are treated as applying to all respondents, which supports backward compatibility and simplifies authoring. This approach eliminates the need for complex logic or separate rule engines, as the branching behavior is encoded naturally alongside the question definition.

On the frontend, all questions for a survey are loaded up front and filtered client-side based on the selected role. This makes the user experience faster and more responsive (since we don’t need to make additional API calls as the role changes). For the short-to-medium surveys we're targeting, this keeps things efficient. If we eventually build significantly longer or more complex surveys, we can revisit that strategy.

### Response organization
I've introduced a submission model to act as the parent for a set of responses. This lets us store shared information (like the selected role) once per submission instead of duplicating it across responses. It also sets us up to support additional context in the future, such as associating submissions with users or survey versions.

This approach keeps things flexible and straightforward for internal use while leaving room to grow if needed.

## Results
The Results tab displays visual summaries of survey data. Currently, the UI supports rating and multiple choice question types, which are rendered as bar charts for quick interpretation. Users can filter results by survey and role using dropdowns.

This implementation is built for flexibility, additional filters like created_at or time-based comparisons (e.g., line graphs for change over time) could be easily integrated. The existing data structure supports these future enhancements without requiring major changes to the underlying models or queries.

For some information, we might want to query the database directly. For example, if we wanted to quickly pull the lowest ranked question to address it:
   ```
   SELECT
   q.id AS question_id,
   q.content AS question_text,
   ROUND(AVG(r.value::numeric), 2) AS average_rating
   FROM
   questions q
   JOIN
   responses r ON r.question_id = q.id
   WHERE
   q.question_type = 'rating'
   AND r.survey_id = 1  -- Replace with your actual survey ID
   GROUP BY
   q.id, q.content
   ORDER BY
   average_rating ASC
   LIMIT 1;
   ```
or we may want to check how the average response for a ranked choice question has changed between two time periods:
   ```
   WITH ranked_responses AS (
     SELECT
       r.question_id,
       r.value::int AS rating,
       s.created_at::date AS submission_date
     FROM responses r
     JOIN submissions s ON r.submission_id = s.id
     WHERE r.question_id = 42  -- <-- replace with the actual question_id
   ),
   period_averages AS (
     SELECT
       CASE
         WHEN submission_date < '2024-12-31' THEN 'before'
         ELSE 'after'
       END AS period,
       ROUND(AVG(rating)::numeric, 2) AS avg_rating
     FROM ranked_responses
     WHERE submission_date BETWEEN '2024-10-01' AND '2025-06-01'
     GROUP BY 1
   )
   SELECT
     MAX(CASE WHEN period = 'before' THEN avg_rating END) AS avg_before,
     MAX(CASE WHEN period = 'after' THEN avg_rating END) AS avg_after,
     ROUND(
       MAX(CASE WHEN period = 'after' THEN avg_rating END)
       - MAX(CASE WHEN period = 'before' THEN avg_rating END),
       2
     ) AS avg_change
   FROM period_averages;
   ```

----
# Proctor: Basic Survey Application

### Note: Existing README is unedited below this point

This is a coding challenge created by DX. It houses a basic survey application that will serve as the basis for the challenge.

## Challenge Description
The scenario: We want to be able customize questions in the survey depending on the role of the person responding (i.e. Data Engineer, Frontend Engineer, Product Manager, etc.).

Here's what we'd like to see:
* Implement a way to define the different branches of a survey and the questions that are shown or hidden for each branch
* Update the respondent experience to collect their role and then display the appropriate questions based on the branch
* (If time allows) Add a way to analyze the response data between the different branches

The boilerplate code provides a very basic survey application with the ability to create surveys, add questions, and collect responses. Your job is to extend this functionality to support branching.

Any and all existing code or seed data can be edited in any way. Anything that's here is purely to serve as a functional starting point to begin building off of.

## Evaluation Criteria
The purpose of this exercise is to evaluate how you would implement a moderately complex feature, consider tradeoffs, and explain your thinking on a real project. We are not evaluating your ability to implement algorithms from scratch — feel free to use tools or libraries that you would reach for in your actual day to day work.

## Technology Stack

- **Backend**: Ruby on Rails 7
- **Frontend**: React with esbuild
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL

## Getting Started

### Prerequisites

- Ruby 3.1.3 or higher
- PostgreSQL
- Node.js (for JavaScript and CSS processing)

### Setup Instructions (macOS)

#### Install Dependencies with Homebrew

1. Install Homebrew (if not already installed)
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. Install Ruby via rbenv
   ```bash
   brew install rbenv ruby-build
   echo 'eval "$(rbenv init -)"' >> ~/.zshrc  # or ~/.bash_profile for bash users
   source ~/.zshrc  # or source ~/.bash_profile for bash users
   rbenv install 3.1.3
   rbenv global 3.1.3
   ruby -v  # Verify installation
   ```

3. Install PostgreSQL
   ```bash
   brew install postgresql@15
   brew services start postgresql@15
   ```

4. Install Node.js
   ```bash
   # Install nvm (Node Version Manager) for better Node.js version management
   brew install nvm

   # Create NVM's working directory if it doesn't exist
   mkdir -p ~/.nvm

   # Add NVM to your shell profile
   echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
   echo '[ -s "/usr/local/opt/nvm/nvm.sh" ] && . "/usr/local/opt/nvm/nvm.sh"' >> ~/.zshrc
   echo '[ -s "/usr/local/opt/nvm/etc/bash_completion.d/nvm" ] && . "/usr/local/opt/nvm/etc/bash_completion.d/nvm"' >> ~/.zshrc

   # Source the updated profile
   source ~/.zshrc

   # Install and use Node.js version 20 (compatible with the project dependencies)
   nvm install 20
   nvm use 20

   # Verify installation
   node -v
   ```

#### Project Setup

1. Clone this repository
   ```bash
   git clone <repository-url>
   cd proctor
   ```

2. Install Ruby dependencies
   ```bash
   gem install bundler
   bundle install
   ```

3. Install JavaScript dependencies
   ```bash
   npm install
   ```

4. Setup the database
   ```bash
   bin/rails db:create
   bin/rails db:migrate
   bin/rails db:seed
   ```

5. Start the Rails server and build the frontend assets
   ```bash
   bin/dev
   ```

6. Visit `http://localhost:3000` in your browser

## React Components

The application uses React for the frontend. The main components are:

- **SurveyForm**: For creating and editing surveys
- **QuestionList**: For displaying and managing questions
- **TakeSurvey**: For taking surveys and submitting responses

These components are located in the `app/javascript/components` directory.

## Submission

Please fork this github repo, and include your solution as a PR to the forked repo with clear instructions on how to run your code. Include any notes or explanations in the README or as comments in your code.

Good luck!
